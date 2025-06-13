"use client"

import { Copy } from "lucide-react";
import { useState } from "react";

const CopySection = ({
  children,
  copyData,
}: {
  children: React.ReactNode;
  copyData: any;
}) => {
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let text_to_right = ""
    if (typeof copyData === "string")
      text_to_right = copyData
    else {
      for (const text of copyData) {
        text_to_right += text + "\n"
      }
    } 
    navigator.clipboard.writeText(text_to_right);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div
      className="relative group p-2 rounded-md hover:bg-muted transition-all"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-5 text-muted-foreground hover:text-primary transition"
        >
          <Copy className="w-4 h-4" />
        </button>
      )}
      {children}
      {copied && (
        <div className="absolute top-2 right-12 text-xs text-green-600 font-medium">
          Copied!
        </div>
      )}
    </div>
  );
};
export default CopySection;
