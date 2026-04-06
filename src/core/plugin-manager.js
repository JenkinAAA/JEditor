/**
 * @typedef {Object} JPlugin
 * @property {string} name Unique plugin key, aligned with `data-command`.
 * @property {Object} toolbar Toolbar button metadata.
 * @property {string|null} [toolbar.icon] SVG markup for the button icon.
 * @property {string|null} [toolbar.text] Button text when no icon is provided.
 * @property {string} toolbar.title Tooltip text.
 * @property {string|null} [toolbar.shortcut] Shortcut hint text.
 * @property {string|null} [toolbar.className] Extra CSS class for the toolbar button.
 * @property {Object|Object[]|null} [tiptapExtension] One or more Tiptap extensions exposed by the plugin.
 * @property {(editor: any, pluginConfig?: Object) => void} command Execute the plugin action.
 * @property {(editor: any) => boolean} [isActive] Return whether the plugin is active in the current selection.
 * @property {(editor: any) => boolean} [isDisabled] Return whether the plugin action should be disabled.
 * @property {(editor: any, pluginConfig?: Object) => void} [init] Initialize runtime side effects after editor creation.
 * @property {(editor: any) => void} [destroy] Clean up runtime side effects before editor teardown.
 */

export class PluginManager {
  constructor() {
    /** @type {Map<string, JPlugin>} */
    this._plugins = new Map()
  }

  /**
   * Register a single plugin instance.
   */
  register(plugin) {
    if (!plugin.name) throw new Error('[JEditor] Plugin is missing a name field.')
    this._plugins.set(plugin.name, plugin)
  }

  /**
   * Register multiple plugins in order.
   */
  registerAll(plugins) {
    plugins.forEach((plugin) => this.register(plugin))
  }

  /**
   * Get a plugin by name.
   */
  get(name) {
    return this._plugins.get(name)
  }

  /**
   * Return all registered plugins.
   */
  getAll() {
    return Array.from(this._plugins.values())
  }

  /**
   * Collect all Tiptap extensions exposed by registered plugins.
   */
  getTiptapExtensions() {
    return this.getAll()
      .filter((plugin) => plugin.tiptapExtension != null)
      .flatMap((plugin) =>
        Array.isArray(plugin.tiptapExtension) ? plugin.tiptapExtension : [plugin.tiptapExtension],
      )
  }

  /**
   * Initialize runtime plugin hooks after the editor is created.
   */
  initAll(editor, config = {}) {
    this.getAll().forEach((plugin) => {
      if (typeof plugin.init !== 'function') return
      const configKey = plugin.configKey || plugin.name
      plugin.init(editor, config[configKey] || {})
    })
  }

  /**
   * Tear down all registered plugins and clear the registry.
   */
  destroyAll(editor) {
    this.getAll().forEach((plugin) => {
      if (typeof plugin.destroy === 'function') {
        plugin.destroy(editor)
      }
    })
    this._plugins.clear()
  }
}
