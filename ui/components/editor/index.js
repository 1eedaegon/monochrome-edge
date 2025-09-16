/**
 * Monochrome Edge Editor
 * A modern block-based WYSIWYG editor with local-first storage
 *
 * @example
 * import { Editor } from '@monochrome-edge/ui/editor';
 *
 * const editor = new Editor('#container', {
 *   documentId: 'my-doc',
 *   autoSave: true,
 *   onReady: () => console.log('Editor ready'),
 *   onChange: (doc) => console.log('Document changed', doc),
 *   onSave: (doc) => console.log('Document saved', doc)
 * });
 */

// Use new EditorCore as main Editor
export { EditorCore as Editor } from './core/EditorCore.js';
export { EditorCore } from './core/EditorCore.js';

// Export data model and components for advanced usage
export { EditorDataModel } from './core/EditorDataModel.js';
export { BlockRenderer } from './core/BlockRenderer.js';
export { SelectionManager } from './core/SelectionManager.js';
export { InputHandler } from './core/InputHandler.js';

// Export UI components
export { SlashMenuCore } from './ui/SlashMenuCore.js';
export { TreeFileView } from './ui/TreeFileView.js';
export { TabComponent } from './ui/TabComponent.js';
export { ToolbarCore } from './ui/ToolbarCore.js';
export { FloatingToolbarCore } from './ui/FloatingToolbarCore.js';

// Export storage and other components
export { StorageManager } from './storage/StorageManager.js';
export { StorageCore } from './storage/StorageCore.js';
export { BlockManager } from './blocks/BlockManager.js';
export { CommandManager } from './commands/CommandManager.js';

// Default export
import { EditorCore as Editor } from './core/EditorCore.js';
export default Editor;