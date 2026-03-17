const desc = '<p><img src="https://res.cloudinary.com/dho9r4mcd/image/upload/v1773649096/portfolio/abcd321.jpg"></p>';
const regex = /https:\/\/res\.cloudinary\.com\/[^\s'"]+\/portfolio\/[^\s'"]+/g;

const matches = desc.match(regex);
console.log('Matches:', matches);

if(matches) {
    matches.forEach(url => {
        let cleanUrl = url.replace(/[<>]/g, ''); // just in case
        const parts = cleanUrl.split('/');
        const folder = parts[parts.length - 2];
        const filename = parts[parts.length - 1].split('.')[0];
        console.log('Public ID:', folder + '/' + filename);
    });
}
