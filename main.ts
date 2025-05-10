import {Notice, Plugin, TFile, TFolder } from 'obsidian';

import { Strings } from 'src/strings';
import {MySettings,DEFAULT_SETTINGS} from 'src/setting'

import { addCommands } from 'src/commands';
import {EasyAPI} from 'src/api'



export default class EasyApiPlugin extends Plugin {
	strings : Strings;
	settings: MySettings;
	yaml: string;
	dialog_suggest: Function
	dialog_prompt: Function
	api: EasyAPI


	async onload() {
		
		this.app.workspace.onLayoutReady(
			async()=>{
				await this._onload_()
			}
		)
	}

	async _onload_() {
		// 初始始化，加载中英文和参数
		this.strings = new Strings();
		await this.loadSettings();

		this.api = new EasyAPI(this.app);
		
		this.app.easyapi = this.api;
		window.easyapi = this.api;
		
		// 添加命令
		addCommands(this);

	}

	onunload() {
		
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}
