export const generateProjectId = () => {
    const subset = "123456789qwertyuiopasdfghjklzxcvbnm";
    const length = 7;
    let id = "";
    for (let i = 0; i < length; i++) {
        id += subset[Math.floor(Math.random() * subset.length)];
    }
    return id;
}