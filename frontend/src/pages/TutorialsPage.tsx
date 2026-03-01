import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/shared/Button';
import Card from '../components/shared/Card';
import { toast } from 'react-toastify';

const LANGUAGES = [
    'HTML', 'CSS', 'JAVASCRIPT', 'SQL', 'PYTHON', 'JAVA', 'PHP', 'HOW TO', 'W3.CSS', 'C', 'C++', 'C#'
];

// Define which languages are unlocked (HTML, CSS, and JavaScript)
const UNLOCKED_LANGUAGES = ['HTML', 'CSS', 'JAVASCRIPT'];

const TOPICS: Record<string, string[]> = {
    HTML: [
        'HTML HOME', 'HTML Introduction', 'HTML Editors', 'HTML Basic', 'HTML Elements', 'HTML Attributes',
        'HTML Headings', 'HTML Paragraphs', 'HTML Styles', 'HTML Formatting', 'HTML Quotations',
        'HTML Comments', 'HTML Colors', 'HTML CSS', 'HTML Links', 'HTML Images', 'HTML Favicon',
        'HTML Page Title', 'HTML Tables', 'HTML Lists', 'HTML Block & Inline', 'HTML Div', 'HTML Classes',
        'HTML Id', 'HTML Iframes', 'HTML JavaScript', 'HTML File Paths', 'HTML Head', 'HTML Layout',
        'HTML Responsive', 'HTML Computercode', 'HTML Semantics', 'HTML Style Guide', 'HTML Entities',
        'HTML Symbols', 'HTML Emojis', 'HTML Charset', 'HTML URL Encode', 'HTML vs. XHTML'
    ],
    CSS: [
        'CSS HOME', 'CSS Introduction', 'CSS Syntax', 'CSS Selectors', 'CSS How To', 'CSS Comments',
        'CSS Colors', 'CSS Backgrounds', 'CSS Borders', 'CSS Margins', 'CSS Padding', 'CSS Height/Width',
        'CSS Box Model', 'CSS Outline', 'CSS Text', 'CSS Fonts', 'CSS Icons', 'CSS Links', 'CSS Lists',
        'CSS Tables', 'CSS Display', 'CSS Max-width', 'CSS Position', 'CSS Z-index', 'CSS Overflow',
        'CSS Float', 'CSS Inline-block', 'CSS Align', 'CSS Combinators', 'CSS Pseudo-class',
        'CSS Pseudo-element', 'CSS Opacity', 'CSS Navigation Bar', 'CSS Dropdowns', 'CSS Image Gallery',
        'CSS Image Sprites', 'CSS Attr Selectors', 'CSS Forms', 'CSS Counters', 'CSS Website Layout',
        'CSS Units', 'CSS Specificity', 'CSS !important', 'CSS Math Functions'
    ],
    JAVASCRIPT: [
        'JS HOME', 'JS Introduction', 'JS Where To', 'JS Output', 'JS Statements', 'JS Syntax',
        'JS Comments', 'JS Variables', 'JS Let', 'JS Const', 'JS Operators', 'JS Arithmetic',
        'JS Assignment', 'JS Data Types', 'JS Functions', 'JS Objects', 'JS Events', 'JS Strings',
        'JS String Methods', 'JS Numbers', 'JS Arrays', 'JS Array Methods', 'JS Array Sort',
        'JS Array Iteration', 'JS Dates', 'JS Math', 'JS Random', 'JS Booleans', 'JS Comparisons',
        'JS Conditions', 'JS Switch', 'JS Loop For', 'JS Loop While', 'JS Break', 'JS Type Conversion',
        'JS Bitwise', 'JS RegExp', 'JS Errors', 'JS Scope', 'JS Hoisting', 'JS Strict Mode',
        'JS this Keyword', 'JS Arrow Function', 'JS Classes', 'JS JSON', 'JS Debugging',
        'JS Style Guide', 'JS Best Practices', 'JS Mistakes', 'JS Performance', 'JS Reserved Words'
    ],
    // Fallback for others
    DEFAULT: ['Introduction', 'Getting Started', 'Syntax', 'Variables', 'Comments', 'Data Types']
};

const TUTORIAL_CONTENT: Record<string, any> = {
    'HTML HOME': {
        title: 'HTML Tutorial',
        description: 'HTML is the standard markup language for Web pages. With HTML you can create your own Website. HTML is easy to learn - You will enjoy it!',
        code: `<!DOCTYPE html>
<html>
<head>
<title>Page Title</title>
</head>
<body>

<h1>This is a Heading</h1>
<p>This is a paragraph.</p>

</body>
</html>`,
        language: 'html'
    },
    'HTML Introduction': {
        title: 'HTML Introduction',
        description: 'HTML stands for Hyper Text Markup Language. HTML is the standard markup language for creating Web pages. HTML describes the structure of a Web page. HTML consists of a series of elements. HTML elements tell the browser how to display the content.',
        code: `<!DOCTYPE html>
<html>
<body>

<h1>My First Heading</h1>
<p>My first paragraph.</p>

</body>
</html>`,
        language: 'html'
    },
    'HTML Editors': {
        title: 'HTML Editors',
        description: 'A simple text editor is all you need to learn HTML. Learn HTML using Notepad or TextEdit. Web pages can be created and modified by using professional HTML editors. However, for learning HTML we recommend a simple text editor like Notepad (PC) or TextEdit (Mac).',
        code: `<!DOCTYPE html>
<html>
<body>

<h1>My First HTML Page</h1>
<p>This is my first paragraph.</p>

</body>
</html>`,
        language: 'html'
    },
    'HTML Basic': {
        title: 'HTML Basic Examples',
        description: 'In this chapter we will show some basic HTML examples. Don\'t worry if we use tags you have not learned about yet.',
        code: `<!DOCTYPE html>
<html>
<body>

<h1>This is a heading</h1>
<h2>This is a smaller heading</h2>
<p>This is a paragraph.</p>
<a href="https://www.example.com">This is a link</a>

</body>
</html>`,
        language: 'html'
    },
    'HTML Elements': {
        title: 'HTML Elements',
        description: 'An HTML element is defined by a start tag, some content, and an end tag. The HTML element is everything from the start tag to the end tag.',
        code: `<tagname>Content goes here...</tagname>

<h1>My First Heading</h1>
<p>My first paragraph.</p>`,
        language: 'html'
    },
    'HTML Attributes': {
        title: 'HTML Attributes',
        description: 'HTML attributes provide additional information about HTML elements. Attributes are always specified in the start tag. Attributes usually come in name/value pairs like: name="value"',
        code: `<a href="https://www.example.com">Visit Example</a>
<img src="image.jpg" alt="Description" width="500" height="600">
<p title="I'm a tooltip">This is a paragraph.</p>`,
        language: 'html'
    },
    'CSS HOME': {
        title: 'CSS Tutorial',
        description: 'CSS is the language we use to style an HTML document. CSS describes how HTML elements should be displayed. This tutorial will teach you CSS from basic to advanced.',
        code: `body {
  background-color: lightblue;
}

h1 {
  color: white;
  text-align: center;
}

p {
  font-family: verdana;
  font-size: 20px;
}`,
        language: 'css'
    },
    'CSS Introduction': {
        title: 'CSS Introduction',
        description: 'CSS stands for Cascading Style Sheets. CSS describes how HTML elements are to be displayed on screen, paper, or in other media. CSS saves a lot of work. It can control the layout of multiple web pages all at once.',
        code: `h1 {
  color: blue;
  font-family: verdana;
  font-size: 300%;
}

p {
  color: red;
  font-family: courier;
  font-size: 160%;
}`,
        language: 'css'
    },
    'CSS Syntax': {
        title: 'CSS Syntax',
        description: 'A CSS rule consists of a selector and a declaration block. The selector points to the HTML element you want to style. The declaration block contains one or more declarations separated by semicolons.',
        code: `selector {
  property: value;
  property: value;
}

p {
  color: red;
  text-align: center;
}`,
        language: 'css'
    },
    'CSS Selectors': {
        title: 'CSS Selectors',
        description: 'CSS selectors are used to "find" (or select) the HTML elements you want to style. We can divide CSS selectors into five categories: Simple selectors, Combinator selectors, Pseudo-class selectors, Pseudo-elements selectors, and Attribute selectors.',
        code: `/* Element Selector */
p {
  text-align: center;
  color: red;
}

/* ID Selector */
#para1 {
  text-align: center;
  color: red;
}

/* Class Selector */
.center {
  text-align: center;
  color: red;
}

/* Universal Selector */
* {
  text-align: center;
  color: blue;
}`,
        language: 'css'
    },
    'CSS Colors': {
        title: 'CSS Colors',
        description: 'Colors are specified using predefined color names, or RGB, HEX, HSL, RGBA, HSLA values.',
        code: `/* Color Names */
h1 {
  color: tomato;
}

/* RGB Values */
h2 {
  color: rgb(255, 99, 71);
}

/* HEX Values */
h3 {
  color: #ff6347;
}

/* HSL Values */
p {
  color: hsl(9, 100%, 64%);
}`,
        language: 'css'
    },
    'CSS Backgrounds': {
        title: 'CSS Backgrounds',
        description: 'The CSS background properties are used to add background effects for elements.',
        code: `body {
  background-color: lightblue;
  background-image: url("paper.gif");
  background-repeat: no-repeat;
  background-position: right top;
}

div {
  background: #ffffff url("img_tree.png") no-repeat right top;
}`,
        language: 'css'
    },
    // JavaScript Tutorial Content
    'JS HOME': {
        title: 'JavaScript Tutorial',
        description: 'JavaScript is the world\'s most popular programming language. JavaScript is the programming language of the Web. JavaScript is easy to learn. This tutorial will teach you JavaScript from basic to advanced.',
        code: `<!DOCTYPE html>
<html>
<body>

<h2>My First JavaScript</h2>

<button type="button"
onclick="document.getElementById('demo').innerHTML = Date()">
Click me to display Date and Time.</button>

<p id="demo"></p>

</body>
</html>`,
        language: 'html'
    },
    'JS Introduction': {
        title: 'JavaScript Introduction',
        description: 'JavaScript can change HTML content, attribute values, styles (CSS), and can hide/show HTML elements. JavaScript accepts both double and single quotes.',
        code: `// JavaScript can change HTML content
document.getElementById("demo").innerHTML = "Hello JavaScript";

// JavaScript can change HTML attributes
document.getElementById("myImage").src = "pic_bulbon.gif";

// JavaScript can change CSS styles
document.getElementById("demo").style.fontSize = "35px";

// JavaScript can hide HTML elements
document.getElementById("demo").style.display = "none";

// JavaScript can show HTML elements
document.getElementById("demo").style.display = "block";`,
        language: 'javascript'
    },
    'JS Where To': {
        title: 'JavaScript Where To',
        description: 'In HTML, JavaScript code is inserted between <script> and </script> tags. You can place any number of scripts in an HTML document. Scripts can be placed in the <body>, or in the <head> section of an HTML page, or in both.',
        code: `<!-- JavaScript in <head> -->
<!DOCTYPE html>
<html>
<head>
<script>
function myFunction() {
  document.getElementById("demo").innerHTML = "Paragraph changed.";
}
</script>
</head>
<body>
<p id="demo">A Paragraph</p>
<button type="button" onclick="myFunction()">Try it</button>
</body>
</html>

<!-- External JavaScript -->
<script src="myScript.js"></script>`,
        language: 'html'
    },
    'JS Output': {
        title: 'JavaScript Output',
        description: 'JavaScript can "display" data in different ways: innerHTML, document.write(), window.alert(), console.log().',
        code: `// Writing into an HTML element
document.getElementById("demo").innerHTML = 5 + 6;

// Writing into the HTML output
document.write(5 + 6);

// Writing into an alert box
window.alert(5 + 6);

// Writing into the browser console
console.log(5 + 6);`,
        language: 'javascript'
    },
    'JS Statements': {
        title: 'JavaScript Statements',
        description: 'A JavaScript program is a list of programming statements. JavaScript statements are composed of: Values, Operators, Expressions, Keywords, and Comments.',
        code: `// JavaScript statements
let x, y, z;    // Statement 1
x = 5;          // Statement 2
y = 6;          // Statement 3
z = x + y;      // Statement 4

// Multiple statements on one line
a = 5; b = 6; c = a + b;

// JavaScript statements can be grouped in code blocks
function myFunction() {
  document.getElementById("demo1").innerHTML = "Hello Dolly!";
  document.getElementById("demo2").innerHTML = "How are you?";
}`,
        language: 'javascript'
    },
    'JS Syntax': {
        title: 'JavaScript Syntax',
        description: 'JavaScript syntax is the set of rules, how JavaScript programs are constructed. JavaScript values can be: Fixed values (literals) and Variable values (variables).',
        code: `// JavaScript literals
10.50
1001
"John Doe"
'John Doe'

// JavaScript variables
let x;
x = 6;

// JavaScript operators
(5 + 6) * 10

// JavaScript expressions
5 * 10
x * 10
"John" + " " + "Doe"

// JavaScript keywords
let x, y;
x = 5 + 6;
y = x * 10;`,
        language: 'javascript'
    },
    'JS Comments': {
        title: 'JavaScript Comments',
        description: 'JavaScript comments can be used to explain JavaScript code, and to make it more readable. Comments can also be used to prevent execution, when testing alternative code.',
        code: `// Single line comment
let x = 5;      // Declare x, give it the value of 5

/* Multi-line comment
The code below will change
the heading with id = "myH"
and the paragraph with id = "myP"
in my web page: */
document.getElementById("myH").innerHTML = "My First Page";
document.getElementById("myP").innerHTML = "My first paragraph.";

// Prevent execution
// document.getElementById("myH").innerHTML = "My First Page";`,
        language: 'javascript'
    },
    'JS Variables': {
        title: 'JavaScript Variables',
        description: 'Variables are containers for storing data values. In JavaScript, variables can be declared using: var, let, or const.',
        code: `// Using var (old way)
var x = 5;
var y = 6;
var z = x + y;

// Using let (modern way)
let price = 5;
let quantity = 10;
let total = price * quantity;

// Using const (for constants)
const PI = 3.14159;
const name = "John Doe";

// Multiple variables in one statement
let person = "John Doe", carName = "Volvo", price = 200;`,
        language: 'javascript'
    },
    'JS Let': {
        title: 'JavaScript Let',
        description: 'The let keyword was introduced in ES6 (2015). Variables defined with let cannot be redeclared. Variables defined with let must be declared before use. Variables defined with let have block scope.',
        code: `// let has block scope
{
  let x = 2;
}
// x can NOT be used here

// var has function scope
{
  var x = 2;
}
// x CAN be used here

// Cannot be redeclared
let x = "John Doe";
// let x = 0;  // Error

// Must be declared before use
carName = "Volvo";
let carName;  // Error`,
        language: 'javascript'
    },
    'JS Const': {
        title: 'JavaScript Const',
        description: 'The const keyword was introduced in ES6 (2015). Variables defined with const cannot be redeclared. Variables defined with const cannot be reassigned. Variables defined with const have block scope.',
        code: `// const must be assigned when declared
const PI = 3.14159;

// Cannot be reassigned
// PI = 3.14;  // Error

// Constant objects can be changed
const car = {type:"Fiat", model:"500", color:"white"};
car.color = "red";  // OK
car.owner = "Johnson";  // OK

// Constant arrays can be changed
const cars = ["Saab", "Volvo", "BMW"];
cars[0] = "Toyota";  // OK
cars.push("Audi");  // OK`,
        language: 'javascript'
    },
    'JS Operators': {
        title: 'JavaScript Operators',
        description: 'JavaScript operators are used to perform operations on variables and values. JavaScript has arithmetic, assignment, comparison, logical, type, and bitwise operators.',
        code: `// Arithmetic operators
let x = 5;
let y = 2;
let z = x + y;  // Addition
let z = x - y;  // Subtraction
let z = x * y;  // Multiplication
let z = x / y;  // Division
let z = x % y;  // Modulus
let z = x ** y; // Exponentiation

// Assignment operators
x = 10;
x += 5;   // x = x + 5
x -= 5;   // x = x - 5
x *= 5;   // x = x * 5

// Comparison operators
x == y    // Equal to
x === y   // Equal value and type
x != y    // Not equal
x !== y   // Not equal value or type
x > y     // Greater than
x < y     // Less than`,
        language: 'javascript'
    },
    'JS Functions': {
        title: 'JavaScript Functions',
        description: 'A JavaScript function is a block of code designed to perform a particular task. A JavaScript function is executed when "something" invokes it (calls it).',
        code: `// Function declaration
function myFunction(p1, p2) {
  return p1 * p2;   // Return the product
}

// Function call
let result = myFunction(4, 3);

// Function expression
const x = function (a, b) {return a * b};
let z = x(4, 3);

// Arrow function (ES6)
const multiply = (a, b) => a * b;
let result = multiply(4, 3);

// Function with default parameters
function greet(name = "Guest") {
  return "Hello " + name;
}`,
        language: 'javascript'
    },
    'JS Objects': {
        title: 'JavaScript Objects',
        description: 'JavaScript objects are containers for named values called properties and methods. Objects are variables too, but objects can contain many values.',
        code: `// Creating an object
const person = {
  firstName: "John",
  lastName: "Doe",
  age: 50,
  eyeColor: "blue",
  fullName: function() {
    return this.firstName + " " + this.lastName;
  }
};

// Accessing object properties
person.firstName;
person["firstName"];

// Accessing object methods
person.fullName();

// Adding new properties
person.nationality = "English";

// Deleting properties
delete person.age;`,
        language: 'javascript'
    },
    'JS Events': {
        title: 'JavaScript Events',
        description: 'HTML events are "things" that happen to HTML elements. When JavaScript is used in HTML pages, JavaScript can "react" on these events.',
        code: `<!-- onclick event -->
<button onclick="document.getElementById('demo').innerHTML = Date()">
  The time is?
</button>

<!-- onchange event -->
<input type="text" id="fname" onchange="myFunction()">

<!-- onmouseover and onmouseout -->
<div onmouseover="mOver(this)" onmouseout="mOut(this)">
  Mouse Over Me
</div>

<script>
// Event handler
function myFunction() {
  let x = document.getElementById("fname");
  x.value = x.value.toUpperCase();
}

// addEventListener
document.getElementById("myBtn").addEventListener("click", displayDate);
</script>`,
        language: 'html'
    },
    'JS Strings': {
        title: 'JavaScript Strings',
        description: 'A JavaScript string is zero or more characters written inside quotes. You can use single or double quotes. Strings can be created as primitives or as objects.',
        code: `// String literals
let text = "John Doe";
let text = 'John Doe';

// String length
let length = text.length;

// Escape characters
let text = "We are the so-called \\"Vikings\\" from the north.";
let text = 'It\\'s alright.';
let text = "The character \\\\ is called backslash.";

// Template literals (ES6)
let firstName = "John";
let lastName = "Doe";
let text = \`Welcome \${firstName}, \${lastName}!\`;

// Multi-line strings
let text = \`The quick
brown fox
jumps over
the lazy dog\`;`,
        language: 'javascript'
    },
    'JS Arrays': {
        title: 'JavaScript Arrays',
        description: 'An array is a special variable, which can hold more than one value. Arrays are used to store multiple values in a single variable.',
        code: `// Creating an array
const cars = ["Saab", "Volvo", "BMW"];

// Array with different types
const myArray = ["Apple", 10, true, {name: "John"}];

// Accessing array elements
let car = cars[0];  // First element
let car = cars[2];  // Third element

// Changing array elements
cars[0] = "Opel";

// Array length
let length = cars.length;

// Adding elements
cars.push("Audi");        // Add to end
cars[cars.length] = "Ford";  // Add to end
cars.unshift("Mazda");    // Add to beginning

// Looping through array
for (let i = 0; i < cars.length; i++) {
  console.log(cars[i]);
}`,
        language: 'javascript'
    },
    // Add more content as needed, fallback generic content otherwise
};

const TutorialsPage: React.FC = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('HTML');
    const [selectedTopic, setSelectedTopic] = useState('HTML HOME');

    const isLanguageUnlocked = (lang: string) => UNLOCKED_LANGUAGES.includes(lang);

    const handleLanguageClick = (lang: string) => {
        if (!isLanguageUnlocked(lang)) {
            toast.warning(`🔒 ${lang} tutorial is locked! Complete HTML, CSS & JavaScript first to unlock more content.`, {
                position: 'top-center',
                autoClose: 3000,
            });
            return;
        }
        setSelectedLanguage(lang);
        setSelectedTopic(TOPICS[lang]?.[0] || TOPICS.DEFAULT[0]);
    };

    const topics = TOPICS[selectedLanguage] || TOPICS.DEFAULT;
    const currentContent = TUTORIAL_CONTENT[selectedTopic] || {
        title: selectedTopic,
        description: `Learn everything about ${selectedTopic} in ${selectedLanguage}. This tutorial covers the fundamentals and advanced concepts.`,
        code: `// Example code for ${selectedTopic}\nconsole.log("Hello ${selectedLanguage}!");`,
        language: selectedLanguage.toLowerCase()
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Unlock Notice Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                    </svg>
                    <span className="font-semibold">
                        ✅ HTML, CSS & JavaScript Unlocked | 🔒 Other tutorials locked - Complete basics first!
                    </span>
                </div>
            </div>

            {/* Top Language Bar */}
            <div className="flex flex-wrap bg-slate-800 text-white">
                {LANGUAGES.map(lang => {
                    const isUnlocked = isLanguageUnlocked(lang);
                    return (
                        <button
                            key={lang}
                            onClick={() => handleLanguageClick(lang)}
                            disabled={!isUnlocked}
                            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                                selectedLanguage === lang && isUnlocked
                                    ? 'bg-blue-600 hover:bg-blue-600'
                                    : isUnlocked
                                    ? 'hover:bg-slate-700'
                                    : 'opacity-50 cursor-not-allowed bg-slate-900'
                            }`}
                        >
                            {!isUnlocked && (
                                <svg 
                                    className="w-4 h-4" 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                >
                                    <path 
                                        fillRule="evenodd" 
                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" 
                                        clipRule="evenodd" 
                                    />
                                </svg>
                            )}
                            {lang}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar Topics */}
                <div className="w-64 bg-slate-50 dark:bg-slate-800 overflow-y-auto border-r border-slate-200 dark:border-slate-700 flex-shrink-0 hidden md:block">
                    <h2 className="px-4 py-4 text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                        {selectedLanguage} Tutorial
                    </h2>
                    <div className="py-2">
                        {topics.map(topic => (
                            <button
                                key={topic}
                                onClick={() => setSelectedTopic(topic)}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedTopic === topic
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold border-l-4 border-blue-600'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
                            {currentContent.title}
                        </h1>

                        <div className="flex justify-between mb-8">
                            <Button variant="secondary" size="sm" onClick={() => {
                                const currentIndex = topics.indexOf(selectedTopic);
                                if (currentIndex > 0) setSelectedTopic(topics[currentIndex - 1]);
                            }}>
                                &larr; Previous
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => {
                                const currentIndex = topics.indexOf(selectedTopic);
                                if (currentIndex < topics.length - 1) setSelectedTopic(topics[currentIndex + 1]);
                            }}>
                                Next &rarr;
                            </Button>
                        </div>

                        <div className="prose dark:prose-invert max-w-none mb-8">
                            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                                {currentContent.description}
                            </p>
                        </div>

                        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border-l-4 border-blue-500 mb-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Example</h3>
                            <div className="bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700 font-mono text-sm overflow-x-auto mb-4 text-slate-800 dark:text-slate-200">
                                <pre>{currentContent.code}</pre>
                            </div>
                            <Link to="/code-editor">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Try it Yourself &raquo;
                                </Button>
                            </Link>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{selectedLanguage} Exercises</h2>
                            <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                <p className="mb-4">Test your {selectedLanguage} skills with a quiz.</p>
                                <Link to="/exams">
                                    <Button variant="primary">Start {selectedLanguage} Quiz</Button>
                                </Link>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialsPage;
