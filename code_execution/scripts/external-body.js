
(function(){
  __demo.stamp('CASE 4: external script in <body> executed while parsing');
  const btn = document.getElementById('btn-ext');
  if (btn) {
    btn.addEventListener('click', function(){
      __demo.stamp('CASE 4: external script handler ran');
    });
  }
})();
