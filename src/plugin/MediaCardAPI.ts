import { TFile,moment} from "obsidian";
import {EasyAPI} from '../easyapi/easyapi';

export class MediaCardAPI{
	dv:object;
	container:Document;
	covers:Promise<string[]>;
	cover_tfile:TFile;
	ea:EasyAPI;

	constructor(ea:EasyAPI,dv:object,container:Document,cover_tfile:TFile) {
		this.ea = ea;
		this.dv = dv
		this.container = container;
		this.cover_tfile = cover_tfile;
		this.covers = this.get_covers();
	}

	async get_covers(){
		let cfile = this.ea.nc.chain.get_tfile(this.cover_tfile);
		if(!cfile){
			return [];
		}
		let ctx = await this.ea.app.vault.cachedRead(cfile);
		let regex = /\[\[(.*(?:png|jpg|jpeg|gif|webp|svg|bmp))(|[^\]]*)?\]\]/gi;
		let matches = [];
	    let match;
	    
	    while ((match = regex.exec(ctx)) !== null) {
		    if(this.ea.nc.chain.get_tfile(match[1])){
		        matches.push(match[1]);
		    }
	    }
	    return matches;
	}
	
	async note_to_card(tfile:TFile,params={}){
		if(!tfile){
			return;
		}

	    params = { ...params }
		let card:{[key:string]:any} = params
		card['type'] = 'book';
		card['title'] = tfile.basename;
		card['url'] = tfile.basename;
		let tstr = ''
		let words = this.ea.nc.editor.get_frontmatter(tfile,'words');
		if(words==null){
		}else{
			let mts = Array.from(Object.keys(words).sort());
			if(mts.length==1){
				card['创作'] = mts[0];
				card['字数'] = words[mts[0]];
			}else if(mts.length>1){
				card['创作'] = `${mts[0]}/${mts[mts.length - 1]}`;
				card['字数'] = words[mts[mts.length - 1]];
			}else{
				card['字数'] = 0;
			}
		}

		card['路径'] = tfile.parent? tfile.parent.path:tfile.path;

		let niw = this.ea.nc.editor.get_frontmatter(tfile,'NIW');
		if(!niw){
			niw = await this.ea.nc.editor.remove_metadata(tfile);
			if(niw){
				niw = niw.replace(/\s/g,'').slice(0,240);
			}
		}
		if(niw){
			card['introduction'] = niw.replace(/`/g,'');
		}
	
		let cover = this.ea.nc.editor.get_frontmatter(tfile,'cover');
		if(!cover){
			cover = this.ea.nc.chain.get_outlinks(tfile,false).filter(
				(x:TFile)=>['png','jpg','jpeg'].contains(x.extension.toLowerCase())
			)[0]?.name
		}
	
		if(!cover){
			await this.covers.then(covers=>{
				let idx = this.ea.random.string_to_random_number(card['title'],covers.length)
				cover = covers[idx];
			})
		}
		if(cover){
			card['cover'] = cover.replace(/ /g,'%20');
		}
		
		let ctx = `
\`\`\`media-card
${this.ea.editor.yamljs.dump(card)}
\`\`\``
		return ctx;
	}

	async render_notes_to_cards(notes:TFile[],params={}){
	    params = { ...params }
		let i = 0;
		for(let note of notes){
			let tfile = this.ea.nc.chain.get_tfile(note);
			if(tfile){
				let ctx = await this.note_to_card(tfile,params);
				(this.dv as any).span(ctx);
				i = i+1;
			}
		}
		
		let t0 = moment();
		while (
			(this.container as any).querySelectorAll('a').length<i
		) {
			let t1 = moment();
			if((t1.valueOf()-t0.valueOf())/1000>3){
				break;
			}
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		
		for(let a of Array.from(this.container.querySelectorAll('a'))){
			let href = a.getAttr('href');
			if(!href){continue}
			
			let tfile = this.ea.nc.chain.get_tfile(a.getAttr('href'));
			if(!tfile){return}
			a.addEventListener(
				"click", (e:MouseEvent) => {
					this.ea.nc.chain.open_note(tfile)
				}
			);
			
			a.setAttribute('data-href', href);
			a.setAttr('aria-label', href);
			a.addClass('hover-link'); // ✅ 核心
	
			a.addEventListener('mouseenter', (e) => {
				this.ea.app.workspace.trigger("hover-link", {
					event: e,
					source: 'markdown',
					hoverParent: a,
					targetEl: a,
					linktext: href,
					sourcePath: tfile.path,
				});
			});
		}
	}
}