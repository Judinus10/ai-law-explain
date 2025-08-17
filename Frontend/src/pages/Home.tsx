// // src/pages/Home.tsx
// import { useState } from "react";
// import { FileUpload } from "@/components/FileUpload";
// import { DocumentAnalysis } from "@/components/DocumentAnalysis";

// export default function Home() {
//   const [analysis, setAnalysis] = useState<any | null>(null);

//   // Handle uploaded file and send to backend
//   const handleFileUploaded = async (file: File) => {
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await fetch("http://127.0.0.1:5000/upload", {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) throw new Error("Upload failed");

//       const data = await res.json();
//       setAnalysis(data); // pass data to DocumentAnalysis
//     } catch (error) {
//       console.error("Error uploading file:", error);
//     }
//   };

//   return (
//     <div className="p-6 space-y-8">
//       <FileUpload onFileUploaded={handleFileUploaded} />
//       {analysis && <DocumentAnalysis analysis={analysis} />}
//     </div>
//   );
// }
