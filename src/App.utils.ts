export const tabClass = (isActive: boolean) =>
    `py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
      isActive
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`;


export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor((seconds % 3600) / 60);

  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${secs}s`;
  }
};

export const calculateSessionDuration = (start:number,end:number) =>{
  const differenceInSeconds = (end-start)/1000
  return formatTime(differenceInSeconds)
}

export const formatSessionTime = (timestamp:number) => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};