(function(global){
	const BezierCurve = {};
	global.BezierCurve = BezierCurve;


	class Curve{
		constructor(points=[],path=[]){
			this.jpath = points;
			this.path = path;
			this.mousecontrol = false;
		}
		async draw(curve=true){
			await drawPath(this.jpath,this.mousecontrol,curve);
		}
		addPoint(pt_or_tile){
			this.jpath.push(pt_or_tile);
		}
	}

	

	function snapToPath(curve){
		let path = curve.path;
		let jpath = curve.jpath;
		let at = board.getActiveTile();
		if(!at) return;
		if(path.includes(at) && !ct && mouse.down){
			ct = at;
			jpath.push(ct);
		}
		if(mouse.down && at && ct && path.includes(at)){
			if(at != ct){
				jpath.push(at);
				ct = at;
			}
		}
	}

	function getXY(obj){
		if(Tile && obj instanceof Tile){
			return obj.getCenter();
		} else {
			return obj;
		}
	}

	async function drawPath(path=jpath,mousec,curve){
		ctx.lineWidth = 3;
		ctx.strokeColor = '#822';
		// ctx.beginPath();
		let xes = path.map(square=>{
			if(square instanceof Tile){
				return square.getCenter().x;
			}
			if('x' in square){
				return square.x;
			}
		});
		let yes = path.map(square=>{
			if(square instanceof Tile){
				return square.getCenter().y;
			}
			if('y' in square){
				return square.y;
			}
		});
		if(mouse.down && mousec){
			 xes.push(mouse.pos.x);
			 yes.push(mouse.pos.y);				 
			 path.push(mouse.pos);
		}
		let cx = computeControlPoints(xes);
		let cy = computeControlPoints(yes);
		if(path[0]){
			let ct = getXY(path[0])
			// ctx.arc(ct.x,ct.y,30,0,Math.PI*2);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(ct.x,ct.y);
		}
		for(let i=0;i<path.length-1;i++){
			let ct = getXY(path[i+1])
			if(curve){
				ctx.bezierCurveTo(cx.p1[i],cy.p1[i],cx.p2[i],cy.p2[i],ct.x,ct.y);					
			} else {
				ctx.lineTo(ct.x,ct.y);
			}
			ctx.stroke();
			if(animate_draw) { // draw points and animate
				drawPoint(ct.x,ct.y);
				ctx.moveTo(ct.x,ct.y);
				await delay();
			}
		}
		if(mouse.down && mousec){
			path.pop();
		}
		ctx.stroke();
		if(false){ // show control points
			for(let i=0;i<cx.p1.length;i++){
				ctx.beginPath();
				ctx.fillStyle = 'red';
				ctx.arc(cx.p1[i],cy.p1[i],3,0,Math.PI*2);
				ctx.fill();
				ctx.beginPath();
				ctx.fillStyle = 'yellow';
				ctx.arc(cx.p2[i],cy.p2[i],3,0,Math.PI*2);
				ctx.fill();
			}
		}
	}

	function computeControlPoints(K){
		p1=[];
		p2=[];
		n = K.length-1;
		a=[];
		b=[];
		c=[];
		r=[];
		a[0]=0;
		b[0]=2;
		c[0]=1;
		r[0] = K[0]+2*K[1];
		for(i=1;i<n-1;i++){
			a[i]=1;
			b[i]=4;
			c[i]=1;
			r[i]=4*K[i]+2*K[i+1];
		}
		a[n-1]=2;
		b[n-1]=7;
		c[n-1]=0;
		r[n-1]=8*K[n-1]+K[n];
		for(i=1;i<n;i++){
			m=a[i]/b[i-1];
			b[i]=b[i]-m*c[i-1];
			r[i]=r[i]-m*r[i-1];
		}
		p1[n-1]=r[n-1]/b[n-1];
		for(i=n-2;i>=0;--i) p1[i]=(r[i]-c[i]*p1[i+1])/b[i];
		for(i=0;i<n-1;i++) p2[i]=2*K[i+1]-p1[i+1];
		p2[n-1]=0.5*(K[n]+p1[n-1]);
		return {p1,p2};
	}


	BezierCurve.Curve = Curve;
})(this);
