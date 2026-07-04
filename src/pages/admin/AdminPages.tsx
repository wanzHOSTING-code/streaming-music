import { ManagePage } from './ManagePage';

export function AdminSongs() {
  return (
    <ManagePage
      table="songs"
      title="Manage Songs"
      searchFields={['title']}
      columns={[
        { key: 'cover_url', label: 'Cover', render: (item) => <img src={item.cover_url || ''} alt="" className="w-10 h-10 rounded" /> },
        { key: 'title', label: 'Title' },
        { key: 'duration', label: 'Duration', render: (item) => formatDuration(item.duration) },
        { key: 'play_count', label: 'Plays' },
      ]}
      uploadFields={[
        { key: 'title', label: 'Title' },
        { key: 'audio_url', label: 'Audio URL' },
        { key: 'cover_url', label: 'Cover URL' },
        { key: 'duration', label: 'Duration (seconds)', type: 'number' },
        { key: 'lyrics', label: 'Lyrics', type: 'textarea' },
        { key: 'release_date', label: 'Release Date', type: 'date' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      uploadLabel="Add Song"
    />
  );
}

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

export function AdminAlbums() {
  return (
    <ManagePage
      table="albums"
      title="Manage Albums"
      searchFields={['title']}
      columns={[
        { key: 'cover_url', label: 'Cover', render: (item) => <img src={item.cover_url || ''} alt="" className="w-10 h-10 rounded" /> },
        { key: 'title', label: 'Title' },
        { key: 'release_date', label: 'Release Date' },
      ]}
      uploadFields={[
        { key: 'title', label: 'Title' },
        { key: 'cover_url', label: 'Cover URL' },
        { key: 'release_date', label: 'Release Date', type: 'date' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      uploadLabel="Add Album"
    />
  );
}

export function AdminArtists() {
  return (
    <ManagePage
      table="artists"
      title="Manage Artists"
      searchFields={['name']}
      columns={[
        { key: 'image_url', label: 'Image', render: (item) => <img src={item.image_url || ''} alt="" className="w-10 h-10 rounded-full" /> },
        { key: 'name', label: 'Name' },
        { key: 'monthly_listeners', label: 'Listeners' },
      ]}
      uploadFields={[
        { key: 'name', label: 'Name' },
        { key: 'image_url', label: 'Image URL' },
        { key: 'bio', label: 'Bio', type: 'textarea' },
        { key: 'monthly_listeners', label: 'Monthly Listeners', type: 'number' },
      ]}
      uploadLabel="Add Artist"
    />
  );
}

export function AdminGenres() {
  return (
    <ManagePage
      table="genres"
      title="Manage Genres"
      searchFields={['name']}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'color', label: 'Color', render: (item) => <div className="flex items-center gap-2"><div className="w-6 h-6 rounded" style={{ background: item.color || '#1DB954' }} /><span className="text-xs">{item.color}</span></div> },
      ]}
      uploadFields={[
        { key: 'name', label: 'Name' },
        { key: 'color', label: 'Color (hex)' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'image_url', label: 'Image URL' },
      ]}
      uploadLabel="Add Genre"
    />
  );
}
