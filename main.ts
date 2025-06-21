import {Notice, Plugin, TFile, TFolder } from 'obsidian';

import { Strings } from 'src/plugin/strings';
import {MySettings,DEFAULT_SETTINGS} from 'src/plugin/setting'

import { addCommands } from 'src/plugin/commands';
import {EasyAPI} from 'src/easyapi/easyapi'
import {MediaCardAPI} from 'src/plugin/MediaCardApi'


export default class EasyApiPlugin extends Plugin {
	strings : Strings;
	settings: MySettings;
	api: EasyAPI

	async onload() {
		
		this.app.workspace.onLayoutReady(
			async()=>{
				await this._onload_()
			}
		)
	}

	MediaCardAPI(dv:object,container:Document,cover_tfile:TFile){
		return new MediaCardAPI(this.api,dv,container,cover_tfile)
	}

	async _onload_() {
		// 初始始化，加载中英文和参数
		this.strings = new Strings();
		await this.loadSettings();

		this.api = new EasyAPI(this.app);
		(this.app as any).easyapi = this.api;
		(this.app as any).ea = this.api;
		(window as any).easyapi = this.api;
		(window as any).ea = this.api;
		
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
