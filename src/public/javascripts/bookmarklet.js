javascript:
(
	function() {
		f = 'http://localhost:4444/savescreen?title='
			+encodeURIComponent(document.title)
			+'&address='
			+encodeURIComponent(window.location.href);
		a = function() {
				if(!window.open(f,'deliciousuiv6','location=yes,links=no,scrollbars=no,toolbar=no,width=550,height=550'))
					location.href = f + 'jump=yes'
			};
		if(/Firefox/.test(navigator.userAgent)) {
			setTimeout(a,0)
		} else {
			a()
		}
	}
)()