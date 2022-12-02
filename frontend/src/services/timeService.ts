

export const getTime = () => {
    const value = sessionStorage.getItem('startTime');
    if (value === null) return "now";
    return value;
}

export const setTime = async (startTime: string) => {
    console.log(startTime);
    if (startTime === ""){
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes()
        sessionStorage.setItem('startTime', time);
    } 
    else sessionStorage.setItem('startTime',startTime);
}