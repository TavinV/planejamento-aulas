const periodo = h => (h < '12:00') ? 'manhã' : (h < '19:00') ? 'tarde' : 'noite';
        console.log(periodo("07:30")); // saída: "manhã"
        console.log(periodo("15:45")); // saída: "tarde"
        console.log(periodo("20:10")); // saída: "noite"