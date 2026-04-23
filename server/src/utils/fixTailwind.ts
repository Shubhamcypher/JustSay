// A solid subset of Tailwind utilities inlined directly
const TAILWIND_INLINE = `
*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}
html{line-height:1.5;font-family:ui-sans-serif,system-ui,sans-serif}
body{margin:0}
h1,h2,h3,h4{font-size:inherit;font-weight:inherit}
a{color:inherit;text-decoration:inherit}
img{display:block;vertical-align:middle;max-width:100%}
button,input,select,textarea{font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}
button{cursor:pointer;background-color:transparent;background-image:none}

/* Layout */
.flex{display:flex}.grid{display:grid}.block{display:block}.hidden{display:none}.inline-block{display:inline-block}
.flex-col{flex-direction:column}.flex-row{flex-direction:row}.flex-grow{flex-grow:1}.flex-wrap{flex-wrap:wrap}
.items-center{align-items:center}.items-start{align-items:flex-start}.items-end{align-items:flex-end}
.justify-center{justify-content:center}.justify-between{justify-content:space-between}.justify-end{justify-content:flex-end}
.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}
.gap-2{gap:.5rem}.gap-4{gap:1rem}.gap-6{gap:1.5rem}.gap-8{gap:2rem}
.space-x-2>*+*{margin-left:.5rem}.space-x-4>*+*{margin-left:1rem}
.space-y-2>*+*{margin-top:.5rem}.space-y-4>*+*{margin-top:1rem}

/* Sizing */
.w-full{width:100%}.w-1\\/2{width:50%}.w-1\\/3{width:33.333%}.w-auto{width:auto}
.h-full{height:100%}.h-screen{height:100vh}.h-32{height:8rem}.h-48{height:12rem}.h-64{height:16rem}
.min-h-screen{min-height:100vh}.max-w-md{max-width:28rem}.max-w-lg{max-width:32rem}
.max-w-xl{max-width:36rem}.max-w-2xl{max-width:42rem}.max-w-4xl{max-width:56rem}.max-w-6xl{max-width:72rem}
.mx-auto{margin-left:auto;margin-right:auto}

/* Spacing */
.p-2{padding:.5rem}.p-4{padding:1rem}.p-6{padding:1.5rem}.p-8{padding:2rem}
.px-2{padding-left:.5rem;padding-right:.5rem}.px-4{padding-left:1rem;padding-right:1rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}
.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-4{padding-top:1rem;padding-bottom:1rem}.py-8{padding-top:2rem;padding-bottom:2rem}
.m-0{margin:0}.m-2{margin:.5rem}.m-4{margin:1rem}.mt-2{margin-top:.5rem}.mt-4{margin-top:1rem}.mt-8{margin-top:2rem}
.mb-2{margin-bottom:.5rem}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}
.ml-2{margin-left:.5rem}.mr-2{margin-right:.5rem}

/* Typography */
.text-xs{font-size:.75rem}.text-sm{font-size:.875rem}.text-base{font-size:1rem}.text-lg{font-size:1.125rem}
.text-xl{font-size:1.25rem}.text-2xl{font-size:1.5rem}.text-3xl{font-size:1.875rem}.text-4xl{font-size:2.25rem}
.font-normal{font-weight:400}.font-medium{font-weight:500}.font-semibold{font-weight:600}.font-bold{font-weight:700}
.text-center{text-align:center}.text-left{text-align:left}.text-right{text-align:right}
.text-white{color:#fff}.text-black{color:#000}
.text-gray-400{color:#9ca3af}.text-gray-500{color:#6b7280}.text-gray-600{color:#4b5563}.text-gray-700{color:#374151}.text-gray-800{color:#1f2937}.text-gray-900{color:#111827}
.text-blue-500{color:#3b82f6}.text-blue-600{color:#2563eb}.text-red-500{color:#ef4444}.text-green-500{color:#22c55e}
.text-indigo-600{color:#4f46e5}.text-purple-600{color:#9333ea}.text-pink-500{color:#ec4899}
.leading-tight{line-height:1.25}.leading-normal{line-height:1.5}.leading-relaxed{line-height:1.625}
.tracking-wide{letter-spacing:.025em}.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.uppercase{text-transform:uppercase}.capitalize{text-transform:capitalize}

/* Backgrounds */
.bg-white{background-color:#fff}.bg-black{background-color:#000}.bg-transparent{background-color:transparent}
.bg-gray-50{background-color:#f9fafb}.bg-gray-100{background-color:#f3f4f6}.bg-gray-200{background-color:#e5e7eb}.bg-gray-800{background-color:#1f2937}.bg-gray-900{background-color:#111827}
.bg-blue-500{background-color:#3b82f6}.bg-blue-600{background-color:#2563eb}.bg-blue-700{background-color:#1d4ed8}
.bg-red-500{background-color:#ef4444}.bg-green-500{background-color:#22c55e}.bg-indigo-600{background-color:#4f46e5}
.bg-purple-600{background-color:#9333ea}.bg-pink-500{background-color:#ec4899}
.bg-gradient-to-r{background-image:linear-gradient(to right,var(--tw-gradient-stops))}
.bg-gradient-to-b{background-image:linear-gradient(to bottom,var(--tw-gradient-stops))}
.from-blue-500{--tw-gradient-from:#3b82f6;--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to,transparent)}
.to-purple-600{--tw-gradient-to:#9333ea}
.from-indigo-600{--tw-gradient-from:#4f46e5;--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to,transparent)}

/* Borders */
.border{border-width:1px}.border-2{border-width:2px}.border-t{border-top-width:1px}.border-b{border-bottom-width:1px}
.border-gray-200{border-color:#e5e7eb}.border-gray-300{border-color:#d1d5db}.border-blue-500{border-color:#3b82f6}
.rounded{border-radius:.25rem}.rounded-md{border-radius:.375rem}.rounded-lg{border-radius:.5rem}.rounded-xl{border-radius:.75rem}.rounded-2xl{border-radius:1rem}.rounded-full{border-radius:9999px}
.border-transparent{border-color:transparent}

/* Shadows */
.shadow{box-shadow:0 1px 3px rgba(0,0,0,.1),0 1px 2px rgba(0,0,0,.06)}
.shadow-md{box-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06)}
.shadow-lg{box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05)}
.shadow-xl{box-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 10px 10px -5px rgba(0,0,0,.04)}

/* Object fit */
.object-cover{object-fit:cover}.object-contain{object-fit:contain}.object-center{object-position:center}

/* Overflow */
.overflow-hidden{overflow:hidden}.overflow-auto{overflow:auto}.overflow-y-auto{overflow-y:auto}

/* Position */
.relative{position:relative}.absolute{position:absolute}.fixed{position:fixed}.sticky{position:sticky}
.top-0{top:0}.bottom-0{bottom:0}.left-0{left:0}.right-0{right:0}.inset-0{inset:0}
.z-10{z-index:10}.z-50{z-index:50}

/* Transitions & Hover */
.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}
.duration-200{transition-duration:.2s}.duration-300{transition-duration:.3s}
.cursor-pointer{cursor:pointer}.select-none{user-select:none}
.opacity-0{opacity:0}.opacity-50{opacity:.5}.opacity-100{opacity:1}

/* Hover states */
.hover\\:bg-blue-500:hover{background-color:#3b82f6}.hover\\:bg-blue-700:hover{background-color:#1d4ed8}
.hover\\:bg-gray-100:hover{background-color:#f3f4f6}.hover\\:bg-gray-700:hover{background-color:#374151}
.hover\\:text-blue-500:hover{color:#3b82f6}.hover\\:text-blue-600:hover{color:#2563eb}.hover\\:text-white:hover{color:#fff}
.hover\\:shadow-lg:hover{box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05)}
.hover\\:scale-105:hover{transform:scale(1.05)}

/* Responsive */
@media(min-width:640px){.sm\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.sm\\:flex-row{flex-direction:row}}
@media(min-width:768px){.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.md\\:flex-row{flex-direction:row}.md\\:w-1\\/2{width:50%}}
@media(min-width:1024px){.lg\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.lg\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.lg\\:flex-row{flex-direction:row}}

/* Focus */
.focus\\:outline-none:focus{outline:none}.focus\\:ring-2:focus{box-shadow:0 0 0 2px rgba(59,130,246,.5)}
.outline-none{outline:none}

/* Misc */
.list-none{list-style-type:none}.pointer-events-none{pointer-events:none}
.whitespace-nowrap{white-space:nowrap}.break-words{overflow-wrap:break-word}
.aspect-square{aspect-ratio:1/1}.aspect-video{aspect-ratio:16/9}
`;

export function fixTailwind(files: Record<string, any>) {
    const newFiles = { ...files };

    // Strip any Tailwind build deps from package.json
    if (newFiles["package.json"]) {
        try {
          const pkg = JSON.parse(newFiles["package.json"].content);
      
          // ✅ ENSURE REQUIRED DEPENDENCIES
          pkg.dependencies = pkg.dependencies || {};
          pkg.devDependencies = pkg.devDependencies || {};
      
          // 🔥 REQUIRED FOR VITE TO RUN
          pkg.devDependencies["vite"] = "^4.5.0";
          pkg.devDependencies["@vitejs/plugin-react"] = "^4.0.0";
      
          // 🔥 REQUIRED FOR REACT
          pkg.dependencies["react"] = "^18.2.0";
          pkg.dependencies["react-dom"] = "^18.2.0";
      
          // 🔥 ENSURE SCRIPTS
          pkg.scripts = pkg.scripts || {};
          pkg.scripts["dev"] = "vite";
      
          // ❌ REMOVE BROKEN TAILWIND SETUP
          delete pkg.dependencies?.["@tailwindcss/vite"];
          delete pkg.dependencies?.["tailwindcss"];
          delete pkg.devDependencies?.["tailwindcss"];
          delete pkg.devDependencies?.["postcss"];
          delete pkg.devDependencies?.["autoprefixer"];
      
          newFiles["package.json"].content = JSON.stringify(pkg, null, 2);
        } catch (err) {
          console.error("❌ package.json fix failed", err);
        }
      }

    // Clean vite.config - no Tailwind plugin needed
    newFiles["vite.config.ts"] = {
        content: `
      import { defineConfig } from 'vite';
      import react from '@vitejs/plugin-react';
      
      export default defineConfig({
        plugins: [react()],
      });
      `.trim()
    };

    // Inject inlined CSS into index.html, remove any CDN refs
    if (!newFiles["index.html"].content.includes("TAILWIND_INLINE_MARK")) {
        newFiles["index.html"].content = newFiles["index.html"].content
            .replace(/<script src="https:\/\/cdn\.tailwindcss\.com.*?><\/script>\n?/g, "")
            .replace(/<link.*?tailwind.*?>\n?/g, "")
            .replace(
                "</head>",
                `<style id="TAILWIND_INLINE_MARK">${TAILWIND_INLINE}</style>\n</head>`
            );
    }

    // global.css - just a body font reset, no @tailwind directives
    newFiles["src/styles/global.css"] = {
        content: `body { font-family: system-ui, sans-serif; margin: 0; }`
    };


    // Remove PostCSS/Tailwind config files
    delete newFiles["tailwind.config.js"];
    delete newFiles["postcss.config.js"];

    // Ensure global.css imported in main.tsx
    if (newFiles["src/main.tsx"]) {
        if (!newFiles["src/main.tsx"].content.includes("global.css")) {
            newFiles["src/main.tsx"].content =
                `import './styles/global.css';\n` +
                newFiles["src/main.tsx"].content;
        }
    }

    return newFiles;
}