var ws = new WebSocket('ws://localhost');
ws.onopen = function(){
    ws.onmessage = function(data){
        console.log(data.data)
    }
    ws.send("hbj")
}