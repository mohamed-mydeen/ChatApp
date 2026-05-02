export default function ChatListItem({ 
  id, name, message, time, unread, online, isActive, onClick 
}: { 
  id: string; name: string; message: string; time: string; unread: number; online: boolean; isActive: boolean; onClick: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center px-3 py-3 gap-3 cursor-pointer transition-colors duration-150 border-b border-gray-100 dark:border-gray-800/50
        ${isActive ? 'bg-[#f0f2f5] dark:bg-[#2a3942]' : 'hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]'}`}
    >
      <div className="relative flex-shrink-0">
        <img 
          src={`https://i.pravatar.cc/150?u=${id}`} 
          alt={name} 
          className="w-12 h-12 rounded-full object-cover"
        />
        {online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#111b21] rounded-full"></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h3 className="font-medium text-[16px] text-gray-900 dark:text-[#e9edef] truncate">{name}</h3>
          <span className={`text-[12px] whitespace-nowrap ml-2 ${unread > 0 ? 'text-[#25D366]' : 'text-gray-500 dark:text-[#8696a0]'}`}>
            {time}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-[#8696a0] truncate w-full pr-2">
            {message}
          </p>
          {unread > 0 && (
            <div className="bg-[#25D366] text-white text-[11px] font-bold rounded-full h-[20px] min-w-[20px] px-1.5 flex items-center justify-center flex-shrink-0">
              {unread}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
