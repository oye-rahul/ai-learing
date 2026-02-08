import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchProjects, createProject, deleteProject } from '../store/slices/projectsSlice';
import { AppDispatch } from '../store/store';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import Modal from '../components/shared/Modal';
import ProjectEditor from '../components/features/ProjectEditor';
import { toast } from 'react-toastify';

const ProjectsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading } = useSelector((state: RootState) => state.projects);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [openProject, setOpenProject] = useState<any>(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    language: 'javascript',
    is_public: false,
    code: '',
  });

  const [templates] = useState([
    {
      id: '1',
      title: 'HTML Web Page',
      description: 'Basic HTML page with styling and interactivity',
      language: 'html',
      code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        h1 { color: #fff; text-align: center; }
        button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
        }
        button:hover { background: #45a049; }
        #output {
            margin-top: 20px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            min-height: 50px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌟 Welcome to My Web Page!</h1>
        <p>This is a simple HTML template with CSS styling and JavaScript.</p>
        <button onclick="showMessage()">Click Me!</button>
        <button onclick="changeColor()">Change Color</button>
        <div id="output"></div>
    </div>
    
    <script>
        function showMessage() {
            document.getElementById('output').innerHTML = 
                '<h3>Hello! 👋</h3><p>You clicked the button at ' + new Date().toLocaleTimeString() + '</p>';
        }
        
        function changeColor() {
            const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            document.body.style.background = 'linear-gradient(135deg, ' + randomColor + ' 0%, #764ba2 100%)';
        }
    </script>
</body>
</html>`,
    },
    {
      id: '2',
      title: 'JavaScript Calculator',
      description: 'Simple calculator with basic arithmetic operations',
      language: 'javascript',
      code: `// Simple Calculator
class Calculator {
    add(a, b) {
        return a + b;
    }
    
    subtract(a, b) {
        return a - b;
    }
    
    multiply(a, b) {
        return a * b;
    }
    
    divide(a, b) {
        if (b === 0) {
            throw new Error("Cannot divide by zero!");
        }
        return a / b;
    }
    
    power(base, exponent) {
        return Math.pow(base, exponent);
    }
    
    squareRoot(num) {
        if (num < 0) {
            throw new Error("Cannot calculate square root of negative number!");
        }
        return Math.sqrt(num);
    }
}

// Example usage
const calc = new Calculator();

console.log("=== Calculator Demo ===");
console.log("5 + 3 =", calc.add(5, 3));
console.log("10 - 4 =", calc.subtract(10, 4));
console.log("6 * 7 =", calc.multiply(6, 7));
console.log("20 / 4 =", calc.divide(20, 4));
console.log("2 ^ 8 =", calc.power(2, 8));
console.log("√16 =", calc.squareRoot(16));

// Array operations
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, num) => calc.add(acc, num), 0);
console.log("\\nSum of", numbers, "=", sum);`,
    },
    {
      id: '3',
      title: 'Python Data Processor',
      description: 'Process and analyze data with Python',
      language: 'python',
      code: `# Python Data Processor
import statistics

class DataProcessor:
    def __init__(self, data):
        self.data = data
    
    def get_sum(self):
        return sum(self.data)
    
    def get_average(self):
        return statistics.mean(self.data)
    
    def get_median(self):
        return statistics.median(self.data)
    
    def get_max(self):
        return max(self.data)
    
    def get_min(self):
        return min(self.data)
    
    def get_range(self):
        return self.get_max() - self.get_min()
    
    def display_stats(self):
        print("=" * 40)
        print("DATA ANALYSIS REPORT")
        print("=" * 40)
        print(f"Data: {self.data}")
        print(f"Count: {len(self.data)}")
        print(f"Sum: {self.get_sum()}")
        print(f"Average: {self.get_average():.2f}")
        print(f"Median: {self.get_median()}")
        print(f"Maximum: {self.get_max()}")
        print(f"Minimum: {self.get_min()}")
        print(f"Range: {self.get_range()}")
        print("=" * 40)

# Example usage
numbers = [23, 45, 67, 12, 89, 34, 56, 78, 90, 21]
processor = DataProcessor(numbers)
processor.display_stats()

# Filter even numbers
even_numbers = [n for n in numbers if n % 2 == 0]
print(f"\\nEven numbers: {even_numbers}")

# Filter odd numbers
odd_numbers = [n for n in numbers if n % 2 != 0]
print(f"Odd numbers: {odd_numbers}")`,
    },
    {
      id: '4',
      title: 'C Program - Student Records',
      description: 'Manage student records with C programming',
      language: 'c',
      code: `#include <stdio.h>
#include <string.h>

#define MAX_STUDENTS 5

// Structure to store student information
struct Student {
    int id;
    char name[50];
    float marks;
    char grade;
};

// Function to calculate grade based on marks
char calculateGrade(float marks) {
    if (marks >= 90) return 'A';
    else if (marks >= 80) return 'B';
    else if (marks >= 70) return 'C';
    else if (marks >= 60) return 'D';
    else return 'F';
}

// Function to display student information
void displayStudent(struct Student s) {
    printf("ID: %d | Name: %-20s | Marks: %.2f | Grade: %c\\n", 
           s.id, s.name, s.marks, s.grade);
}

int main() {
    struct Student students[MAX_STUDENTS] = {
        {101, "Alice Johnson", 92.5, 'A'},
        {102, "Bob Smith", 78.0, 'C'},
        {103, "Charlie Brown", 85.5, 'B'},
        {104, "Diana Prince", 95.0, 'A'},
        {105, "Eve Wilson", 67.5, 'D'}
    };
    
    // Calculate grades for all students
    for (int i = 0; i < MAX_STUDENTS; i++) {
        students[i].grade = calculateGrade(students[i].marks);
    }
    
    // Display header
    printf("\\n");
    printf("========================================\\n");
    printf("       STUDENT RECORDS SYSTEM\\n");
    printf("========================================\\n\\n");
    
    // Display all students
    for (int i = 0; i < MAX_STUDENTS; i++) {
        displayStudent(students[i]);
    }
    
    // Calculate and display average
    float total = 0;
    for (int i = 0; i < MAX_STUDENTS; i++) {
        total += students[i].marks;
    }
    float average = total / MAX_STUDENTS;
    
    printf("\\n========================================\\n");
    printf("Class Average: %.2f\\n", average);
    printf("========================================\\n");
    
    return 0;
}`,
    },
  ]);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleCreateProject = async (template?: any) => {
    try {
      const projectData = template ? {
        title: template.title,
        description: template.description,
        language: template.language,
        code: template.code,
        is_public: false,
      } : {
        ...newProject,
        code: getDefaultCode(newProject.language),
      };

      await dispatch(createProject(projectData)).unwrap();
      toast.success('Project created successfully!');
      setShowCreateModal(false);
      setShowTemplatesModal(false);
      setNewProject({
        title: '',
        description: '',
        language: 'javascript',
        is_public: false,
        code: '',
      });
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const getDefaultCode = (language: string): string => {
    const templates: Record<string, string> = {
      html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
      css: '/* CSS Stylesheet */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background: #f0f0f0;\n}\n\nh1 {\n    color: #333;\n}',
      javascript: '// JavaScript Code\nconsole.log("Hello, World!");\n\nfunction greet(name) {\n    return "Hello, " + name + "!";\n}\n\nconsole.log(greet("World"));',
      python: '# Python Code\nprint("Hello, World!")\n\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))',
      c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
      java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      r: '# R Programming\nprint("Hello, World!")\n\n# Create a vector\nnumbers <- c(1, 2, 3, 4, 5)\nprint(paste("Sum:", sum(numbers)))\nprint(paste("Mean:", mean(numbers)))',
    };
    return templates[language.toLowerCase()] || "// " + language + " code\nconsole.log(\"Hello, World!\");";
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${projectTitle}"?`)) {
      try {
        await dispatch(deleteProject(projectId)).unwrap();
        toast.success('Project deleted successfully');
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = !selectedLanguage || project.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  const languages = ['html', 'css', 'javascript', 'python', 'c', 'cpp', 'java', 'r'];

  const getLanguageIcon = (language: string) => {
    const icons: Record<string, string> = {
      html: '🌐',
      css: '🎨',
      javascript: '🟨',
      python: '🐍',
      c: '⚡',
      cpp: '⚙️',
      java: '☕',
      r: '📊',
    };
    return icons[language] || '📄';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // If a project is open, show the editor
  if (openProject) {
    return (
      <ProjectEditor
        project={openProject}
        onBack={() => {
          setOpenProject(null);
          // Refresh projects list to get updated code
          dispatch(fetchProjects());
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            My Projects
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Build, collaborate, and showcase your coding projects
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowTemplatesModal(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Use Template
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          <div className="md:w-48">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </Card>
          ))
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Create your first project to get started!
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Project
            </Button>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} hover>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">
                    {getLanguageIcon(project.language)}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                      {project.language}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {project.is_public && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                      Public
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteProject(project.id, project.title)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                {project.description || 'No description provided'}
              </p>

              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span>Updated {formatDate(project.updated_at)}</span>
                {project.collaborators && project.collaborators.length > 0 && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {project.collaborators.length}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setOpenProject(project)}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Open
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(project.code || '');
                    toast.success('Code copied to clipboard!');
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Project"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Project Title"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            placeholder="Enter project title"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Describe your project..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Language
            </label>
            <select
              value={newProject.language}
              onChange={(e) => setNewProject({ ...newProject, language: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Initial Code (Optional)
            </label>
            <textarea
              value={newProject.code}
              onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
              placeholder="Leave empty to use default template..."
              rows={8}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-mono text-sm"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_public"
              checked={newProject.is_public}
              onChange={(e) => setNewProject({ ...newProject, is_public: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
            />
            <label htmlFor="is_public" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">
              Make this project public
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleCreateProject()}
              disabled={!newProject.title.trim()}
            >
              Create Project
            </Button>
          </div>
        </div>
      </Modal>

      {/* Templates Modal */}
      <Modal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        title="Choose a Template"
        size="xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} hover className="cursor-pointer">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">
                  {getLanguageIcon(template.language)}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {template.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                    {template.language}
                  </p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                {template.description}
              </p>

              <Button
                size="sm"
                className="w-full"
                onClick={() => handleCreateProject(template)}
              >
                Use Template
              </Button>
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
