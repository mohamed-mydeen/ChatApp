import { Check, CheckCheck, Download, FileText, FileImage, FileVideo, FileAudio } from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  content: string;
  time: string;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
  // Optional file attachment
  file?: {
    name: string;
    type: string;        // MIME type
    size: number;
    dataUrl: string;     // base64 data URL
  };
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/')) return <FileImage size={22} className="text-blue-400" />;
  if (type.startsWith('video/')) return <FileVideo size={22} className="text-purple-400" />;
  if (type.startsWith('audio/')) return <FileAudio size={22} className="text-pink-400" />;
  return <FileText size={22} className="text-gray-400" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MessageBubble({ content, time, isOwn, status, file }: MessageBubbleProps) {
  const isImage = file?.type.startsWith('image/');

  return (
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} group mb-2 px-4`}>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98, transformOrigin: isOwn ? 'bottom right' : 'bottom left' }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className={`relative max-w-[85%] md:max-w-[65%] shadow-sm overflow-hidden
          ${file && !content ? '' : 'px-3 py-1.5'}
          ${isOwn
            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-[#e9edef] rounded-lg rounded-tr-none'
            : 'bg-white dark:bg-[#202c33] text-gray-900 dark:text-[#e9edef] rounded-lg rounded-tl-none'
          }
        `}
      >
        {/* ── Image attachment ─────────────────────────────────────────────── */}
        {file && isImage && (
          <div className="relative group/img">
            <img
              src={file.dataUrl}
              alt={file.name}
              className="block max-w-full max-h-64 object-cover rounded-md"
              style={{ minWidth: 160 }}
            />
            <a
              href={file.dataUrl}
              download={file.name}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 bg-black/30 transition-opacity rounded-md"
            >
              <Download size={24} className="text-white drop-shadow" />
            </a>
          </div>
        )}

        {/* ── Non-image file attachment ─────────────────────────────────── */}
        {file && !isImage && (
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg flex-shrink-0">
              <FileIcon type={file.type} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{file.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-[#8696a0]">{formatBytes(file.size)}</p>
            </div>
            <a
              href={file.dataUrl}
              download={file.name}
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <Download size={16} className="text-gray-600 dark:text-gray-300" />
            </a>
          </div>
        )}

        {/* ── Caption / text content ────────────────────────────────────── */}
        {content && (
          <span className={`leading-relaxed text-[14.5px] ${file ? 'block px-3 pt-1.5' : ''}`}>
            {content}
          </span>
        )}

        {/* ── Timestamp + tick ─────────────────────────────────────────────── */}
        <div className={`flex items-center justify-end gap-1 text-[11px] text-gray-500 dark:text-[#8696a0] mt-1 ${file && !content ? 'px-3 pb-1' : ''}`}>
          <span>{time}</span>
          {isOwn && (
            <span className="ml-0.5">
              {status === 'sent'      && <Check     size={14} />}
              {status === 'delivered' && <CheckCheck size={14} />}
              {status === 'read'      && <CheckCheck size={14} className="text-[#53bdeb]" />}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
