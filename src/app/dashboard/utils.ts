

export const handleUserMenuClick = ({ key }: { key: string }) => {
  if (key === 'logout') {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/login';
  } else if (key === 'profile') {
    console.log('Opening profile...');
  }
};