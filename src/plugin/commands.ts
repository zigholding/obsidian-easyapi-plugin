import { 
	Notice, TFile
} from 'obsidian';

import EasyApiPlugin from '../../main';

const commandBuilders:Array<Function> = [
    
];

const commandBuildersDesktop:Array<Function> = [

];

export function addCommands(plugin:EasyApiPlugin) {
    commandBuilders.forEach((c) => {
        plugin.addCommand(c(plugin));
    });
	if((plugin.app as any).isMobile==false){
		commandBuildersDesktop.forEach((c) => {
			console.log('add:',c)
			plugin.addCommand(c(plugin));
		});
	}
}