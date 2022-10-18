
let obj1 = {prop : 42}  // stored at memory heap at location 1001
let obj2 = obj1 // copy refererance location of obj1=  1001

obj2.prop = 50

console.log(obj1,obj2)

for(let i=0;i<10;i++){
    setTimeout(()=>{
        console.log(i)
    },2000)
}

for(var i=0;i<5;i++){
    setTimeout(()=>{
        console.log(i)
    },1000)
    console.log(i)
}