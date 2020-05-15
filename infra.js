import { Parsed } from '/vendor/infrajs/controller/src/Parsed.js'

// Event.handler('Layer.onshow', async (layer) => {
// 	if (layer.autosavenametpl) layer.autosavename = Template.parse([layer.autosavenametpl], layer);
// 	if (!layer.autosavename) return;
// 	Autosave.hand(layer.autosavename, layer.div);
// }, 'autosave:dom');



Parsed.add(layer => { 
	//parsed должен забираться после установки msg config-a
	//После onsubmit слой должен перепарсится
	if (!layer.onsubmit) return ''
	if (!layer.config || !layer.config.ans) return ''
	let str = layer.config.ans.msg
	if (!str) str = ''
	if (layer.config.ans.time) {
		str += layer.config.ans.time
	}
	return str
})