export const tabClass = (isActive: boolean) =>
    `py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
      isActive
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`;