export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'N/A';
  }

  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'N/A';
  }

  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleString();
  } catch (error) {
    return 'Invalid Date';
  }
} 