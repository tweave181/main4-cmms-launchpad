
import { useState, useMemo } from 'react';
import type { Database } from '@/integrations/supabase/types';

type JobTitle = Database['public']['Tables']['job_titles']['Row'];

export const useJobTitleFilters = (jobTitles: JobTitle[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedJobTitles = useMemo(() => {
    let filtered = jobTitles;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((jobTitle) =>
        jobTitle.title_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const comparison = a.title_name.localeCompare(b.title_name);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [jobTitles, searchTerm, sortOrder]);

  return {
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    filteredAndSortedJobTitles,
  };
};
