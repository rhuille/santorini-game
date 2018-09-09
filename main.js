
// Global variables
var adjacentSquare = {},
  opacity = 0.3,
  state
  data = [];

// initialize data
for (i = 0; i < 25; i++) {
  var s = 'c' + Math.floor(i/5) + '' + i%5;
  data.push(s);
  adjacentSquare[s] = [];
  for (dx = -1; dx <= 1; ++dx) {
    for (dy = -1; dy <= 1; ++dy) {
        if (dx != 0 || dy != 0) {
          var x = Math.floor(i/5)+dx, y = i%5 + dy;
          adjacentSquare[s].push('c' + x + '' + y)
        }
    }
  }
}
for (i = 0; i < 25; i++) {
  s = data[i]
  adjacentSquare[s] = adjacentSquare[s].filter(function(d){return data.includes(d) })
}

function loadBoard() {


  // create board and sizing
  d3.select("#board")
    .selectAll("div")
    .data(data)
    .enter()
    .append("div")
    .attr('class', 'square')
    .attr('id', function(d){return d})
    .attr('level', '0')
    .attr('worker', '')
    .attr('selected', 'false')
    .attr('possiblemove', '')

  boardSizing();
  window.addEventListener("resize", boardSizing);
}

function boardSizing() {

  var windowHeight = window.innerHeight,
      windowWidth = window.innerWidth,
      titleHeight = d3.select('#header').node().getBoundingClientRect().height+d3.select('#bar').node().getBoundingClientRect().height,
      boardSize = d3.min([windowHeight - titleHeight,  windowWidth])*0.8;
  
  d3.select("#board")
    .style('width', boardSize+'px')
    .style('height', boardSize+'px')

}




//
d3.select('#button').on('click', load)

d3.select('.navbar-btn').on('click', load)


function loadGame(){
  console.log('load')

  d3.select('#turn').html('Your turn')
  d3.select('#button').html('&#x25BE;')
  d3.select('#shortInstructions').html('(Beginning)')
  d3.select('#instructions').html('Select the square where to place your first worker')

  state = 'init-1';

  d3.selectAll('.square')
    .on('click', onClick)

  d3.select('#button')
    .on('click', function(){
      console.log('display instructions')

      d3.select('#instructions')
        .transition()
        .duration(500)
        .style('opacity', 1-d3.select('#instructions').style('opacity') )

    })

}


function load(){
  d3.selectAll('#board > *').remove()
  loadBoard()
  loadGame()
}


// main function 
function onClick(){
  if (state=='init-1'){
    d3.select(this).attr('worker', 'Af').append('div').attr('class', 'worker human')
    ai();

    // Next state
    state = 'init-2';
    d3.select('#instructions').html('Select the square where to place your second worker')
    return;
  }

  if (state=='init-2'){
    d3.select(this).attr('worker', 'Ag').append('div').attr('class', 'worker human')
    ai();

    // Next state
    state = 'player-select-to-move';
    d3.select('#instructions').html('Select the worker you want to move')
    d3.select('#shortInstructions').html('(Move)')
    return;
  }

  if (state=='player-select-to-move'){

    if( d3.select(this).attr('worker')=='' ){
      console.log('There is no worker on this square !')
      return;
    }

    if( ['Bg', 'Bf'].includes(d3.select(this).attr('worker')) ){
      console.log('This is not your worker !')
      return;
    }
    
    if( ['Ag', 'Af'].includes(d3.select(this).attr('worker')) ){
      
      d3.select(this).attr('class', d3.select(this).attr('class')+ ' selected');
      d3.select(this).attr('selected', 'true')
      // identify possible square to move :

      var a = adjacentSquare[d3.select(this).attr('id')];

      for (i = 0; i < a.length; i++) {
        if ( d3.select("#"+a[i]).attr('worker') == '' ){ 
          if ( (parseInt(d3.select("#"+a[i]).attr('level')) -  parseInt(d3.select(this).attr('level'))) < 2 ){
            d3.select("#"+a[i]).attr('possiblemove', 'true')
          }
        }
      }

      d3.select(this).attr('possiblemove', 'true')
      d3.selectAll("[possiblemove= '']").style('opacity', opacity)
      d3.select(this).attr('possiblemove', '')

      // Next state
      state = 'player-move';
      d3.select('#instructions').html('Click where you want your worker to go')
      return;
    }
  }

  if (state=='player-move'){
    if(d3.select(this).attr('selected')=='true'){
      d3.select(this).classed('selected', false).attr('selected', 'false')

      // back
      state = 'player-select-to-move';
      d3.selectAll(".square").style('opacity', 1).attr('possiblemove', '')
      return;
    }

    if(d3.select(this).attr('possiblemove')==''){
      console.log('This is not a possible move !')
      return;
    }

    if(d3.select(this).attr('possiblemove')=='true'){
      
      d3.select(this)
        .attr('worker', d3.select(".selected").attr('worker'))
        .append('div')
        .attr('class', 'worker human')
      
      d3.selectAll(".square").style('opacity', 1)
      d3.select(".selected > .worker").remove()
      d3.select(".selected").classed('selected', false)
        .attr('selected', 'false')
        .attr('worker', '')

      d3.selectAll(".square").attr('possiblemove', '')


      if (d3.select(this).attr('level')=='3'){
        console.log('You win !')

        state='ended'
        d3.select('#turn').html('You win  🎉 Want to play again ?')
        d3.select('#instructions').html('&nbsp')
        d3.select('#shortInstructions').html(' ')
          d3.select('#button').html('&#x2694;').on('click', load)
        return;
      }

      // identify possible square to build :
        var a = adjacentSquare[d3.select(this).attr('id')];
        for (i = 0; i < a.length; i++) {
          if ( d3.select("#"+a[i]).attr('worker') == '' ){ 
            if ( d3.select("#"+a[i]).attr('level') != '4' ){
              d3.select("#"+a[i]).attr('possiblemove', 'true')
            }
          }
        }

        d3.select(this).attr('possiblemove', 'true')
        d3.selectAll("[possiblemove= '']").style('opacity', opacity)
        d3.select(this).attr('possiblemove', '')

      // Next state
      state = 'player-build';
      d3.select('#instructions').html('Build in a square adjacent to your moved worker')
      d3.select('#shortInstructions').html('(Build)')
      return;
    }

  }

  if (state=='player-build'){

    if(d3.select(this).attr('possiblemove')==''){
      console.log('You cannot build here')
      return;
    }

    if(d3.select(this).attr('possiblemove')=='true'){
      
      d3.select(this).attr('level', parseInt(d3.select(this).attr('level'))+1)
      d3.select(this).append('div').attr('class', 'level'+d3.select(this).attr('level'))
      d3.selectAll(".square").style('opacity', 1).attr('possiblemove', '')


      state='ai-select-to-move';
      ai();

      return;
    }
  }

}

