import { 
	App, PluginSettingTab, Setting,Plugin
} from 'obsidian';

import EasyApiPlugin from '../../main';

export interface MySettings {
}

export const DEFAULT_SETTINGS: MySettings = {
}

export class WebViewLLMSettingTab extends PluginSettingTab {
	plugin: EasyApiPlugin;
	constructor(app: App, plugin: EasyApiPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingValue(field: keyof MySettings) {
		return this.plugin.settings[field];
	}

	add_toggle(name:string,desc:string,field:keyof MySettings){
		let {containerEl} = this;
		let value = (this.plugin.settings as any)[field] as boolean;
		let item = new Setting(containerEl)  
			.setName(name)
			.setDesc(desc)
			.addToggle(text => text
				.setValue(value)
				.onChange(async (value:never) => {
					this.plugin.settings[field] = value;
					await this.plugin.saveSettings();
				})
			);
		return item;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
	}
}
