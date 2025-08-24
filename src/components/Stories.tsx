import React from 'react';
import { Plus } from 'lucide-react';
import styles from './Stories.module.css';

export default function Stories() {
  // Placeholder stories data
  const stories = [
    { id: '1', username: 'Your Story', isOwn: true },
  ];

  return (
    <div className={styles.stories}>
      <div className={styles.storiesContainer}>
        {stories.map(story => (
          <button key={story.id} className={styles.story}>
            <div className={`${styles.storyRing} ${story.isOwn ? styles.ownStory : ''}`}>
              <div className={styles.storyAvatar}>
                {story.isOwn ? (
                  <Plus size={24} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {story.username[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <span className={styles.storyUsername}>{story.username}</span>
          </button>
        ))}
      </div>
    </div>
  );
}