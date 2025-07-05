import React, { useEffect } from 'react';

const DocumentTitle = ({ title }: { title: string }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
};

export default DocumentTitle;
