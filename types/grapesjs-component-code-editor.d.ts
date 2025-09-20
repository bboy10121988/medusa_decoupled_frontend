// Type definitions for grapesjs-component-code-editor
declare module 'grapesjs-component-code-editor' {
  import { Plugin } from 'grapesjs';
  
  interface CodeEditorOptions {
    modalTitle?: string;
    codeViewOptions?: {
      theme?: string;
      lineNumbers?: boolean;
      styleActiveLine?: boolean;
      autoCloseBrackets?: boolean;
      matchBrackets?: boolean;
      mode?: string;
    };
    panelTitle?: string;
    commandName?: string;
    editJs?: boolean;
    editCss?: boolean;
    editHtml?: boolean;
  }
  
  const plugin: Plugin<CodeEditorOptions>;
  export default plugin;
}