ai = function() {
    console.log('ai played !')

    if (state=='init-1'){
        var randomIndex = Math.floor(Math.random() * (data.length-1) );
        var c = data.filter(function(d){ return d3.select('#'+d).attr('worker') == ''  })[randomIndex];
        d3.select("#"+c).attr('worker', 'Bf').append('div').attr('class', 'worker ai')
        return;
    }

    if (state=='init-2'){
        var randomIndex = Math.floor(Math.random() * (data.length-3) );
        var c = data.filter(function(d){ return d3.select('#'+d).attr('worker') == ''  })[randomIndex];
        d3.select("#"+c).attr('worker', 'Bg').append('div').attr('class', 'worker ai')
        return;
    }

    if (state=='ai-select-to-move'){

        // compute 
        var workerToMove = ['Bf', 'Bg'][Math.floor(Math.random() * 2)];

        var a = adjacentSquare[d3.select('[worker= '+ workerToMove+ ']').attr('id')],
            b = [];

        for (i = 0; i < a.length; i++) {
            if ( d3.select("#"+a[i]).attr('worker') == '' ){ 
                if ( (parseInt(d3.select("#"+a[i]).attr('level')) -  parseInt(d3.select('[worker= '+ workerToMove+ ']').attr('level'))) < 2 ){
                    b.push(a[i])
                }
            }
        }

        var squareWhereToMove = b[Math.floor(Math.random() * b.length)];

        a = adjacentSquare[squareWhereToMove];
        b = [];

        for (i = 0; i < a.length; i++) {
            if ( d3.select("#"+a[i]).attr('worker') == '' ){ 
                if ( d3.select("#"+a[i]).attr('level') != '4' ){
                    b.push(a[i])
                }
            }
        }

        var squareWhereToBuild = b[Math.floor(Math.random() * b.length)];

        // animate
        d3.select('#instructions').html( ' &nbsp ' )
        d3.select('#turn').html( 'AI is playing' )
        d3.select('#shortInstructions').html(' &nbsp ')

        d3.select('#c00')
        .transition().delay(300)
        .on('start', function(){
            // document.getElementById(d3.select('[worker= '+ workerToMove+ ']').attr('id')).click();

            this_ = '[worker= '+ workerToMove+ ']'
            d3.select(this_).attr('class', d3.select(this_).attr('class')+ ' selected');
            d3.select(this_).attr('selected', 'true')
            // identify possible square to move :

            var a = adjacentSquare[d3.select(this_).attr('id')];

            for (i = 0; i < a.length; i++) {
            if ( d3.select("#"+a[i]).attr('worker') == '' ){ 
                if ( (parseInt(d3.select("#"+a[i]).attr('level')) -  parseInt(d3.select(this_).attr('level'))) < 2 ){
                d3.select("#"+a[i]).attr('possiblemove', 'true')
                }
            }
            }

            d3.select(this_).attr('possiblemove', 'true')
            d3.selectAll("[possiblemove= '']").style('opacity', opacity)
            d3.select(this_).attr('possiblemove', '')

            // Next state
            state = 'ai-move';
        })
        .transition().delay(800)
        .on('start', function(){
            // document.getElementById(d3.select('#'+squareWhereToMove).attr('id')).click();
            this_ = '#'+squareWhereToMove
            d3.select(this_)
              .attr('worker', d3.select(".selected").attr('worker'))
              .append('div')
              .attr('class', 'worker ai')
            
            d3.selectAll(".square").style('opacity', 1)
            d3.select(".selected > .worker").remove()
            d3.select(".selected").classed('selected', false)
            .attr('selected', 'false')
            .attr('worker', '')

            d3.selectAll(".square").attr('possiblemove', '')

            if (d3.select(this_).attr('level')=='3'){
            console.log('You lost ')
            d3.select('#turn').html('You lost  😱 ')
            d3.select('#instructions').html('&nbsp')
            d3.select('#shortInstructions').html(' ')
            state='ended'
            return;
            }

            // identify possible square to build :
            var a = adjacentSquare[d3.select(this_).attr('id')];
            for (i = 0; i < a.length; i++) {
                if ( d3.select("#"+a[i]).attr('worker') == '' ){ 
                if ( d3.select("#"+a[i]).attr('level') != '4' ){
                    d3.select("#"+a[i]).attr('possiblemove', 'true')
                }
                }
            }

            d3.select(this_).attr('possiblemove', 'true')
            d3.selectAll("[possiblemove= '']").style('opacity', opacity)
            d3.select(this_).attr('possiblemove', '')

            // Next state
            state = 'ai-construct';

        })
        .transition().delay(800)
        .on('start', function(){
            this_ = '#'+squareWhereToBuild
            d3.select(this_).attr('level', parseInt(d3.select(this_).attr('level'))+1)
            d3.select(this_).append('div').attr('class', 'level'+d3.select(this_).attr('level'))
            d3.selectAll(".square").style('opacity', 1).attr('possiblemove', '')

            // Next state
            state = 'player-select-to-move';
            d3.select('#turn').html('Your turn')
            d3.select('#shortInstructions').html('(Move)')
            d3.select('#instructions').html(' Select the worker you want to move')
        })

    }


}