const parseFeed = (doc) => {
  const feed = {
    title: doc.querySelector('channel > title')?.textContent || 'No title',
    description: doc.querySelector('channel > description')?.textContent || 'No description',
  };

  const items = doc.querySelectorAll('item');
  const posts = Array.from(items).map((item) => ({
    title: item.querySelector('title')?.textContent || 'No title',
    link: item.querySelector('link')?.textContent || 'No link',
    description: item.querySelector('description')?.textContent || 'No description',
  }));

  return { feed, posts };
};

export default parseFeed;
