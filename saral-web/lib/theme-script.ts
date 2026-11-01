/** Runs before first paint (inline in <head>) so there is no theme flash. Keep ES5, no deps. */
export const THEME_STORAGE_KEY = "saral-theme";
export const MOTION_STORAGE_KEY = "saral-motion";

export const themeScript = `(function(){try{var d=document.documentElement;d.classList.add('js');var p=localStorage.getItem('${THEME_STORAGE_KEY}');if(p!=='light'&&p!=='dark')p='system';var r=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;d.setAttribute('data-theme',r);d.setAttribute('data-theme-pref',p);d.style.colorScheme=r;if(localStorage.getItem('${MOTION_STORAGE_KEY}')==='off')d.setAttribute('data-motion','off');}catch(e){}})();`;
