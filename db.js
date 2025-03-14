const dbPromise = indexedDB.open('stories-db', 1);

const StoryDB = {
  saveStory: (story) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('stories-db', 1);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('stories', 'readwrite');
        const store = tx.objectStore('stories');
        const putRequest = store.put(story);
        
        putRequest.onsuccess = () => {
          console.log('Story saved successfully:', story);
          resolve(story);
        };
        
        putRequest.onerror = (event) => {
          console.error('Error saving story:', event.target.error);
          reject(event.target.error);
        };
        
        tx.oncomplete = () => db.close();
      };
      
      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  },
  
  deleteStory: (id) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('stories-db', 1);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('stories', 'readwrite');
        const store = tx.objectStore('stories');
        const deleteRequest = store.delete(id);
        
        deleteRequest.onsuccess = () => {
          console.log(`Story with ID ${id} deleted!`);
          resolve();
        };
        
        deleteRequest.onerror = (event) => {
          console.error(`Error deleting story with ID ${id}:`, event.target.error);
          reject(event.target.error);
        };
        
        tx.oncomplete = () => db.close();
      };
      
      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  },
  
  getStories: () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('stories-db', 1);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('stories', 'readonly');
        const store = tx.objectStore('stories');
        const getRequest = store.getAll();

        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = (event) => reject(event.target.error);
        
        tx.oncomplete = () => db.close();
      };
      
      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  },
  
  clearStories: () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('stories-db', 1);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('stories', 'readwrite');
        const store = tx.objectStore('stories');
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
          console.log('Stories cleared successfully');
          resolve();
        };
        
        clearRequest.onerror = (event) => {
          console.error('Error clearing stories:', event.target.error);
          reject(event.target.error);
        };
        
        tx.oncomplete = () => db.close();
      };
      
      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }
};

dbPromise.onupgradeneeded = (event) => {
  const db = event.target.result;
  if (!db.objectStoreNames.contains('stories')) {
    db.createObjectStore('stories', { keyPath: 'id' });
  }
  console.log('IndexedDB structure created!');
};

dbPromise.onsuccess = (event) => {
  console.log('IndexedDB opened successfully!');
};

dbPromise.onerror = (event) => {
  console.error('Error opening IndexedDB:', event.target.error);
};

export { StoryDB };