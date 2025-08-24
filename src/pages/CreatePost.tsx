import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, MapPin, X } from 'lucide-react';
import { postsService } from '../services/posts';
import styles from './CreatePost.module.css';

export default function CreatePost() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 10) {
      setError('Maximum 10 files allowed');
      return;
    }

    setFiles(selectedFiles);
    
    // Create previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return newPreviews;
    });
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least one image or video');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await postsService.createPost(caption, location || undefined, files);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.createPost}>
      <div className={styles.container}>
        <h1 className={styles.title}>Create New Post</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {previews.length === 0 ? (
            <label className={styles.uploadArea}>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className={styles.fileInput}
              />
              <Image size={48} />
              <p>Click to select photos and videos</p>
              <span>Up to 10 files</span>
            </label>
          ) : (
            <div className={styles.previewsContainer}>
              <div className={styles.previews}>
                {previews.map((preview, index) => (
                  <div key={index} className={styles.previewItem}>
                    {files[index].type.startsWith('video/') ? (
                      <video src={preview} className={styles.previewMedia} />
                    ) : (
                      <img src={preview} alt="" className={styles.previewMedia} />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className={styles.removeBtn}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <label className={styles.addMore}>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className={styles.fileInput}
                />
                <span>+ Add more</span>
              </label>
            </div>
          )}

          <div className={styles.fields}>
            <textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className={styles.caption}
              rows={4}
            />

            <div className={styles.locationField}>
              <MapPin size={20} />
              <input
                type="text"
                placeholder="Add location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={styles.locationInput}
              />
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => navigate('/')}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || files.length === 0}
              className={styles.submitBtn}
            >
              {loading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}