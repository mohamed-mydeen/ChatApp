import { Check, CheckCheck, Download, FileText, FileImage, FileVideo, FileAudio } from 'lucide-react';
import { memo } from 'react';

interface MessageBubbleProps {
  content: string;
  time: string;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
  file?: {
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  };
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/')) return <FileImage size={20} className="text-blue-400" />;
  if (type.startsWith('video/')) return <FileVideo size={20} className="text-purple-400" />;
  if (type.startsWith('audio/')) return <FileAudio size={20} className="text-pink-400" />;
  return <FileText size={20} className="text-gray-400" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ─── Memoized for performance — only re-renders when status/content changes ────
const MessageBubble = memo(function MessageBubble({
  content, time, isOwn, status, file,
}: MessageBubbleProps) {
  const isImage = file?.type.startsWith('image/');

  return (
    <div
      className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-[2px] px-3 ${isOwn ? 'msg-own' : 'msg-other'}`}
      style={{ willChange: 'transform, opacity' }}
    >
      <div
        className={`relative max-w-[78%] md:max-w-[62%] shadow-sm overflow-hidden
          ${!file || content ? 'px-3 py-[7px]' : ''}
          ${isOwn
            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-[#e9edef] rounded-[18px] rounded-tr-[5px]'
            : 'bg-white dark:bg-[#202c33] text-gray-900 dark:text-[#e9edef] rounded-[18px] rounded-tl-[5px]'
          }
        `}
        style={{
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        }}
      >
        {/* ── Image attachment ──────────────────────────────────────────── */}
        {file && isImage && (
          <div className="relative group/img rounded-[14px] overflow-hidden">
            <img
              src={file.dataUrl}
              alt={file.name}
              className="block w-full max-h-64 object-cover"
              loading="lazy"
              decoding="async"
              style={{ minWidth: 160 }}
            />
            <a
              href={file.dataUrl}
              download={file.name}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 bg-black/30 transition-opacity duration-150"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                <Download size={20} className="text-white drop-shadow" />
              </div>
            </a>
          </div>
        )}

        {/* ── Non-image file attachment ──────────────────────────────── */}
        {file && !isImage && (
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="p-2.5 bg-black/5 dark:bg-white/8 rounded-xl flex-shrink-0">
              <FileIcon type={file.type} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{file.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-[#8696a0] mt-0.5">{formatBytes(file.size)}</p>
            </div>
            <a
              href={file.dataUrl}
              download={file.name}
              className="p-2 rounded-full hover:bg-black/8 dark:hover:bg-white/10 transition-colors flex-shrink-0 tap-scale"
            >
              <Download size={16} className="text-gray-600 dark:text-gray-300" />
            </a>
          </div>
        )}

        {/* ── Caption / text ────────────────────────────────────────── */}
        {content && (
          <span
            className={`leading-[1.5] text-[15px] tracking-[-0.01em] ${file ? 'block px-3 pt-2' : ''}`}
            style={{ fontFeatureSettings: '"kern" 1' }}
          >
            {content}
          </span>
        )}

        {/* ── Timestamp + tick ──────────────────────────────────────── */}
        <div className={`flex items-center justify-end gap-[3px] mt-1 ${file && !content ? 'px-3 pb-1.5' : ''}`}>
          <span className="text-[11px] text-gray-500/80 dark:text-[#8696a0] leading-none">{time}</span>
          {isOwn && (
            <span className="flex-shrink-0 leading-none -mb-[1px]">
              {status === 'sent'      && <Check     size={14} className="text-gray-400 dark:text-[#8696a0]" />}
              {status === 'delivered' && <CheckCheck size={14} className="text-gray-400 dark:text-[#8696a0]" />}
              {status === 'read'      && <CheckCheck size={14} className="text-[#53bdeb]" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default MessageBubble;
