# Prototype Chain Implementation ⭐

## Table of Contents
- [Problem Statement](#problem-statement)
- [Core Implementation](#core-implementation)
  - [Basic Prototype](#basic-prototype)
  - [Constructor Functions](#constructor-functions)
  - [ES6 Classes vs Prototype](#es6-classes-vs-prototype)
- [Complexity Analysis](#complexity-analysis)
- [Testing](#testing)
- [Usage & Applications](#usage--applications)
  - [Inheritance Patterns](#inheritance-patterns)
  - [Method Sharing](#method-sharing)
  - [Polyfills](#polyfills)
  - [Object Creation](#object-creation)
- [Interview Tips](#interview-tips)
- [Key Takeaways](#key-takeaways)

---

## Problem Statement

Implement prototype-based inheritance and demonstrate understanding of JavaScript's prototype chain mechanism.

## Quick Start Example

```javascript
// 1. Basic prototype setup
function Person(name, age) {
    this.name = name;
    this.age = age;
}

Person.prototype.greet = function() {
    return `Hi, I'm ${this.name} and I'm ${this.age} years old`;
};

Person.prototype.getInfo = function() {
    return { name: this.name, age: this.age };
};

// Create instances
const person1 = new Person('Alice', 30);
const person2 = new Person('Bob', 25);

console.log(person1.greet()); // "Hi, I'm Alice and I'm 30 years old"
console.log(person2.greet()); // "Hi, I'm Bob and I'm 25 years old"

// 2. Inheritance with prototypes
function Employee(name, age, job) {
    Person.call(this, name, age); // Call parent constructor
    this.job = job;
}

// Set up inheritance
Employee.prototype = Object.create(Person.prototype);
Employee.prototype.constructor = Employee;

// Add methods to child prototype
Employee.prototype.work = function() {
    return `${this.name} is working as a ${this.job}`;
};

Employee.prototype.greet = function() {
    return `${Person.prototype.greet.call(this)} and I work as a ${this.job}`;
};

const emp = new Employee('Carol', 28, 'Developer');
console.log(emp.greet()); // Calls overridden method
console.log(emp.work()); // "Carol is working as a Developer"

// 3. ES6 class equivalent
class ModernPerson {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    greet() {
        return `Hi, I'm ${this.name} and I'm ${this.age} years old`;
    }
}

class ModernEmployee extends ModernPerson {
    constructor(name, age, job) {
        super(name, age);
        this.job = job;
    }
    
    work() {
        return `${this.name} is working as a ${this.job}`;
    }
}

// 4. Prototype chain lookup
console.log(emp.hasOwnProperty('name')); // true (own property)
console.log(emp.hasOwnProperty('greet')); // false (inherited)
console.log(emp.__proto__ === Employee.prototype); // true
console.log(Employee.prototype.__proto__ === Person.prototype); // true
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Core Implementation

### Basic Prototype

```javascript
// Basic prototype demonstration
function Person(name, age) {
    // Instance properties - unique to each object
    this.name = name;
    this.age = age;
}

// Shared methods on prototype - memory efficient
// All Person instances share the same method references
Person.prototype.greet = function() {
    return `Hello, I'm ${this.name} and I'm ${this.age} years old`;
};

Person.prototype.getAge = function() {
    return this.age;
};

Person.prototype.setAge = function(newAge) {
    if (newAge >= 0) {
        this.age = newAge;
    }
};

// Usage: prototype chain lookup
const person1 = new Person('Alice', 30);
const person2 = new Person('Bob', 25);

// Methods are shared via prototype, properties are per-instance
console.log(person1.greet()); // "Hello, I'm Alice and I'm 30 years old"
console.log(person1.greet === person2.greet); // true - same method reference
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Constructor Functions

```javascript
// Advanced constructor function with prototype inheritance
function Animal(species, sound) {
    // Instance properties
    this.species = species;
    this.sound = sound;
    this.energy = 100;
}

// Shared methods on Animal prototype
Animal.prototype.makeSound = function() {
    console.log(`The ${this.species} goes ${this.sound}`);
    this.energy -= 5;
};

Animal.prototype.eat = function() {
    this.energy = Math.min(100, this.energy + 20);
    console.log(`The ${this.species} is eating. Energy: ${this.energy}`);
};

Animal.prototype.sleep = function() {
    this.energy = 100;
    console.log(`The ${this.species} is sleeping. Energy restored.`);
};

// Dog constructor inheriting from Animal
function Dog(name, breed) {
    // Call parent constructor to initialize inherited properties
    Animal.call(this, 'dog', 'woof');
    
    // Additional Dog-specific properties
    this.name = name;
    this.breed = breed;
}

// Set up prototype inheritance chain
// Dog.prototype -> Animal.prototype -> Object.prototype -> null
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog; // Fix constructor reference

// Add Dog-specific methods
Dog.prototype.fetch = function() {
    if (this.energy >= 10) {
        console.log(`${this.name} fetches the ball!`);
        this.energy -= 10;
    } else {
        console.log(`${this.name} is too tired to fetch.`);
    }
};

Dog.prototype.wagTail = function() {
    console.log(`${this.name} wags their tail happily!`);
};

// Override parent method (polymorphism)
Dog.prototype.makeSound = function() {
    console.log(`${this.name} the ${this.breed} barks: ${this.sound}!`);
    this.energy -= 3; // Dogs use less energy barking
};
```

[⬆️ Back to Table of Contents](#table-of-contents)

### ES6 Classes vs Prototype

```javascript
// ES6 Class syntax (syntactic sugar over prototypes)
class ModernPerson {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    // Methods automatically go on prototype
    greet() {
        return `Hello, I'm ${this.name}`;
    }
    
    // Static method (on constructor, not prototype)
    static getSpecies() {
        return 'Homo sapiens';
    }
}

// Equivalent using traditional prototype pattern
function TraditionalPerson(name, age) {
    this.name = name;
    this.age = age;
}

TraditionalPerson.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

// Static method on constructor function
TraditionalPerson.getSpecies = function() {
    return 'Homo sapiens';
};

// Both create the same prototype chain structure
// The class syntax is just more convenient
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Complexity Analysis

### Time Complexity
- **Property Access**: O(d) where d is prototype chain depth
- **Method Call**: O(d) for lookup + O(1) for execution
- **Object Creation**: O(1) for constructor call

### Space Complexity
- **Instance Properties**: O(n) per instance
- **Shared Methods**: O(1) regardless of instance count
- **Prototype Chain**: O(d) where d is inheritance depth

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Testing

```javascript
function testPrototypeChain() {
    // Test basic prototype
    console.log('Testing Basic Prototype:');
    const person = new Person('Alice', 30);
    console.assert(person.name === 'Alice', 'Name should be Alice');
    console.assert(person.greet().includes('Alice'), 'Greet should include name');
    console.assert(Person.prototype.isPrototypeOf(person), 'Person.prototype should be in chain');
    
    // Test inheritance
    console.log('\nTesting Inheritance:');
    const dog = new Dog('Max', 'Golden Retriever');
    console.assert(dog.species === 'dog', 'Species should be dog');
    console.assert(dog.name === 'Max', 'Name should be Max');
    console.assert(dog instanceof Dog, 'Should be instance of Dog');
    console.assert(dog instanceof Animal, 'Should be instance of Animal');
    
    // Test method inheritance
    dog.eat(); // Inherited from Animal
    dog.fetch(); // Dog-specific method
    dog.makeSound(); // Overridden method
    
    // Test prototype chain
    console.log('\nTesting Prototype Chain:');
    console.assert(Object.getPrototypeOf(dog) === Dog.prototype, 'First level correct');
    console.assert(Object.getPrototypeOf(Dog.prototype) === Animal.prototype, 'Second level correct');
    console.assert(Object.getPrototypeOf(Animal.prototype) === Object.prototype, 'Third level correct');
    
    console.log('All prototype tests passed! ✅');
}

testPrototypeChain();
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Usage & Applications

### Inheritance Patterns

```javascript
// Mixin pattern using prototypes
const Flyable = {
    fly() {
        console.log(`${this.name} is flying!`);
    },
    
    land() {
        console.log(`${this.name} has landed.`);
    }
};

const Swimmable = {
    swim() {
        console.log(`${this.name} is swimming!`);
    },
    
    dive() {
        console.log(`${this.name} dives underwater.`);
    }
};

// Duck that can fly and swim
function Duck(name) {
    this.name = name;
}

// Add multiple mixins to Duck prototype
Object.assign(Duck.prototype, Flyable, Swimmable);

Duck.prototype.quack = function() {
    console.log(`${this.name} says quack!`);
};

const duck = new Duck('Donald');
duck.fly();    // From Flyable mixin
duck.swim();   // From Swimmable mixin
duck.quack();  // Duck-specific method
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Method Sharing

```javascript
// Efficient method sharing via prototypes
function createObjectWithSharedMethods() {
    // Shared methods object
    const sharedMethods = {
        log() {
            console.log(`ID: ${this.id}, Data:`, this.data);
        },
        
        update(newData) {
            this.data = { ...this.data, ...newData };
        },
        
        getId() {
            return this.id;
        }
    };
    
    // Factory function that creates objects with shared methods
    return function createInstance(id, data) {
        const instance = Object.create(sharedMethods);
        instance.id = id;
        instance.data = data;
        return instance;
    };
}

const createEntity = createObjectWithSharedMethods();
const entity1 = createEntity(1, { name: 'Entity 1' });
const entity2 = createEntity(2, { name: 'Entity 2' });

// Both entities share the same method references
console.log(entity1.log === entity2.log); // true
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Polyfills

```javascript
// Polyfill for Object.create using prototypes
if (!Object.create) {
    Object.create = function(proto, propertiesObject) {
        // Input validation
        if (typeof proto !== 'object' && typeof proto !== 'function') {
            throw new TypeError('Object prototype may only be an Object or null');
        }
        
        // Create temporary constructor
        function TempConstructor() {}
        
        // Set prototype
        TempConstructor.prototype = proto;
        
        // Create instance
        const obj = new TempConstructor();
        
        // Handle properties descriptor (simplified)
        if (propertiesObject !== undefined) {
            Object.defineProperties(obj, propertiesObject);
        }
        
        return obj;
    };
}

// Polyfill for Array.isArray using prototype checking
if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Object Creation

```javascript
// Advanced object creation patterns
function createAdvancedFactory() {
    // Private shared prototype methods
    const sharedPrototype = {
        // Method to check if object has a property
        hasProperty(prop) {
            return Object.prototype.hasOwnProperty.call(this, prop);
        },
        
        // Method to get all own properties
        getOwnProperties() {
            return Object.getOwnPropertyNames(this).filter(prop => 
                typeof this[prop] !== 'function'
            );
        },
        
        // Method to clone the object
        clone() {
            const cloned = Object.create(Object.getPrototypeOf(this));
            Object.assign(cloned, this);
            return cloned;
        },
        
        // Method to extend object with new properties
        extend(properties) {
            return Object.assign(Object.create(Object.getPrototypeOf(this)), this, properties);
        }
    };
    
    return {
        // Create object with shared methods
        create(initialData = {}) {
            const obj = Object.create(sharedPrototype);
            Object.assign(obj, initialData);
            return obj;
        },
        
        // Create object with specific prototype
        createWithPrototype(proto, initialData = {}) {
            const combinedProto = Object.create(proto);
            Object.assign(combinedProto, sharedPrototype);
            
            const obj = Object.create(combinedProto);
            Object.assign(obj, initialData);
            return obj;
        }
    };
}

const factory = createAdvancedFactory();
const obj = factory.create({ name: 'Test', value: 42 });
console.log(obj.getOwnProperties()); // ['name', 'value']
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Interview Tips

### Discussion Points
1. **Prototype Chain**: How JavaScript looks up properties
2. **Inheritance**: Classical vs prototypal inheritance
3. **Memory Efficiency**: Shared methods vs instance methods
4. **ES6 Classes**: Syntactic sugar over prototypes

### Common Follow-ups
1. **"Difference between `__proto__` and `prototype`"** → Explain instance vs constructor
2. **"How does `instanceof` work?"** → Prototype chain checking
3. **"Performance of prototype lookup"** → Chain traversal implications
4. **"When to use prototypes vs classes"** → Browser support and use cases

### Microsoft-Specific Context
1. **Legacy Browser Support**: Prototype patterns for IE compatibility
2. **Office Applications**: Large object hierarchies with shared behavior
3. **TypeScript**: How prototypes work with type checking
4. **Performance**: Memory optimization in large applications

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Key Takeaways

1. **Prototype Chain**: JavaScript's inheritance mechanism via object linking
2. **Memory Efficiency**: Shared methods on prototypes vs instance methods
3. **Inheritance Patterns**: Multiple ways to achieve inheritance in JavaScript
4. **ES6 Classes**: Syntactic sugar that uses prototypes under the hood
5. **Property Lookup**: Understanding the chain traversal for property access

[⬆️ Back to Table of Contents](#table-of-contents) 