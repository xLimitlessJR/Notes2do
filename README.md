# Notes2do

A simple, elegant note-taking app that automatically extracts and aggregates to-do items from your notes.

## Features

- Create, edit, and delete notes with ease
- Automatic to-do extraction from notes
- Real-time to-do list aggregation
- Mark to-dos as complete directly from the to-do list
- Persistent storage using localStorage
- Clean, modern UI with responsive design

## How to Use

1. Open `index.html` in your web browser
2. Create notes using the input fields in the left panel
3. Watch as to-dos are automatically extracted to the right panel

## To-Do Detection

The app automatically detects to-do items using these patterns:

### Markdown Checkboxes
```
- [ ] Incomplete task
- [x] Completed task
```

### TODO Keywords
```
TODO: Buy groceries
TO DO: Call mom
```

### Bullet Points
```
- Pick up dry cleaning
- Schedule dentist appointment
```

## Example Note

```
Project Planning

TODO: Review design mockups
- [ ] Create database schema
- [ ] Set up development environment
- [x] Install dependencies

Meeting Notes:
- Follow up with team lead
- Update project timeline
```

This note will generate 6 to-do items in your aggregated list!

## Technical Details

- Pure HTML, CSS, and JavaScript (no dependencies)
- Data stored in browser's localStorage
- Works offline
- Mobile-responsive design
