<?php
use infrajs\event\Event;
use infrajs\config\Config;
use infrajs\template\Template;
use infrajs\controller\Layer;


Event::handler('Layer.oncheck', function (&$layer) {
	if (empty($layer['autosavenametpl'])) return;
	$layer['autosavename'] = Template::parse([$layer['autosavenametpl']], $layer);
});