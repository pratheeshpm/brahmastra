const fs = require('fs');
const path = require('path');

const notesDirectory = path.join(__dirname, 'notes');

function migrateTagsToKeywords() {
  console.log('🔄 Starting migration: merging tags into keywords...');
  
  if (!fs.existsSync(notesDirectory)) {
    console.error('❌ Notes directory not found!');
    return;
  }

  const files = fs.readdirSync(notesDirectory).filter(file => file.endsWith('.json'));
  let migratedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    try {
      const filePath = path.join(notesDirectory, file);
      const noteData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Check if note has tags or needs migration
      const hasTags = noteData.tags && Array.isArray(noteData.tags) && noteData.tags.length > 0;
      const hasKeywords = noteData.keywords && Array.isArray(noteData.keywords) && noteData.keywords.length > 0;
      
      if (hasTags || hasKeywords) {
        // Merge tags and keywords, removing duplicates
        const allKeywords = [
          ...(noteData.keywords || []),
          ...(noteData.tags || [])
        ];
        
        // Remove duplicates (case-insensitive)
        const uniqueKeywords = allKeywords.filter((keyword, index, array) => {
          return array.findIndex(k => k.toLowerCase() === keyword.toLowerCase()) === index;
        });
        
        // Update the note
        const updatedNote = {
          ...noteData,
          keywords: uniqueKeywords,
          updatedAt: new Date().toISOString()
        };
        
        // Remove the tags field
        delete updatedNote.tags;
        
        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(updatedNote, null, 2));
        
        console.log(`✅ Migrated ${file}: ${allKeywords.length} total → ${uniqueKeywords.length} unique keywords`);
        migratedCount++;
      } else {
        console.log(`⏭️  Skipped ${file}: no tags or keywords to migrate`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`❌ Error migrating ${file}:`, error.message);
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successfully migrated: ${migratedCount} files`);
  console.log(`⏭️  Skipped (no changes needed): ${skippedCount} files`);
  console.log(`📁 Total files processed: ${files.length}`);
  console.log('\n🎉 Migration completed!');
}

// Run the migration
migrateTagsToKeywords(); 