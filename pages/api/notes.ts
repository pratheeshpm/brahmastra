import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Note {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  keywords?: string[];
}

const notesDirectory = path.join(process.cwd(), 'notes');

// Ensure notes directory exists
if (!fs.existsSync(notesDirectory)) {
  fs.mkdirSync(notesDirectory, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Notes API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (id) {
    // Get specific note
    const noteFile = `${id}.json`;
    const notePath = path.join(notesDirectory, noteFile);

    if (!fs.existsSync(notePath)) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const noteData = JSON.parse(fs.readFileSync(notePath, 'utf8'));
    return res.status(200).json({ data: noteData });
  } else {
    // Get all notes
    const files = fs.readdirSync(notesDirectory).filter(file => file.endsWith('.json'));
    const notes: Note[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(notesDirectory, file);
        const noteData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        notes.push(noteData);
      } catch (error) {
        console.error(`Error reading note file ${file}:`, error);
      }
    }

    // Sort by updatedAt descending
    notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return res.status(200).json({ data: notes });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { topic, content, tags = [], keywords = [] } = req.body;

  if (!topic || !content) {
    return res.status(400).json({ error: 'Topic and content are required' });
  }

  const id = generateId();
  const now = new Date().toISOString();

  const note: Note = {
    id,
    topic,
    content,
    createdAt: now,
    updatedAt: now,
    tags,
    keywords
  };

  const noteFile = `${id}.json`;
  const notePath = path.join(notesDirectory, noteFile);

  fs.writeFileSync(notePath, JSON.stringify(note, null, 2));

  return res.status(201).json({ data: note });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { topic, content, tags, keywords } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Note ID is required' });
  }

  const noteFile = `${id}.json`;
  const notePath = path.join(notesDirectory, noteFile);

  if (!fs.existsSync(notePath)) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const existingNote = JSON.parse(fs.readFileSync(notePath, 'utf8'));

  const updatedNote: Note = {
    ...existingNote,
    ...(topic && { topic }),
    ...(content && { content }),
    ...(tags && { tags }),
    ...(keywords && { keywords }),
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(notePath, JSON.stringify(updatedNote, null, 2));

  return res.status(200).json({ data: updatedNote });
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Note ID is required' });
  }

  const noteFile = `${id}.json`;
  const notePath = path.join(notesDirectory, noteFile);

  if (!fs.existsSync(notePath)) {
    return res.status(404).json({ error: 'Note not found' });
  }

  fs.unlinkSync(notePath);

  return res.status(200).json({ message: 'Note deleted successfully' });
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
} 