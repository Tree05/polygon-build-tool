var elt = document.getElementById("calculator");
var calculator = Desmos.GraphingCalculator(elt, {
    expressions: false,
});
// calculator.setExpression({ id: "graph1", latex: "y=x^2" });

const nSidesInput = document.querySelector("#sides");
const radiusInput = document.querySelector("#radius");
const lengthInput = document.querySelector("#length");
const rotationInput = document.querySelector("#rotation");
const matrixTransformInput = document.querySelector("#matrix-transform");
const roundToInput = document.querySelector("#roundTo");

const calculateButton = document.querySelector("#calculate");
const resultDiv = document.querySelector("#result");

function createPositionNode(index, components) {
    const posDiv = document.createElement("div");
    posDiv.id = "pos" + index;
    posDiv.classList = ["pos"];

    const spanPos = document.createElement("span");
    spanPos.textContent = "pos" + index + ":  ";

    const spanComponents = document.createElement("span");
    spanComponents.classList = ["white"];
    spanComponents.textContent = "(" + components.join(", ") + ")";

    posDiv.appendChild(spanPos);
    posDiv.appendChild(spanComponents);

    return posDiv;

    // <div id="pos${i}" class="pos">
    //                     <span>pos${i}:</span>
    //                     <span class="white">${v.components}</span>
    //                 </div>
}

// #region functions

class Vector {
    constructor(...components) {
        this.components = components;
    }

    add({ components }) {
        return new Vector(
            ...components.map((component, index) => this.components[index] + component)
        );
    }

    subtract({ components }) {
        return new Vector(
            ...components.map((component, index) => this.components[index] - component)
        );
    }

    scaleBy(number) {
        return new Vector(...this.components.map((component) => component * number));
    }

    length() {
        return Math.hypot(...this.components);
    }

    dotProduct({ components }) {
        return components.reduce(
            (acc, component, index) => acc + component * this.components[index],
            0
        );
    }

    round(decimals) {
        return new Vector(...this.components.map((component) => round(component, decimals)));
    }

    length() {
        return Math.hypot(...this.components);
    }
}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function findComponentFormRadians(magnitude, angle) {
    return [magnitude * Math.cos(angle), magnitude * Math.sin(angle)];
}

function findComponentForm(magnitude, angle) {
    return new Vector(
        magnitude * Math.cos(toRadians(angle)),
        magnitude * Math.sin(toRadians(angle))
    );
}

function findRadiusFromSideLength(length, nSides) {
    return (1 / 2) * length * (1 / Math.sin(Math.PI / nSides));
    // return 2 * length * Math.sin(toRadians(180 / nSides));
}

function sideLengthFromRadius(radius, nSides) {
    return 2 * radius * Math.sin(Math.PI / nSides);
    // return radius / (2 * Math.sin(toRadians(180 / nSides)));
}

function findVector(length, nSides, rotation = 0, initialPosition = new Vector(0, 0)) {
    const angle = nSides / 180 + rotation;
    return findComponentForm(length, angle).add(initialPosition);
}

function round(number, decimals) {
    return decimals === 0
        ? Math.round(number)
        : Math.round(number * 10 ** decimals) / 10 ** decimals;
}

// function roundVector(vector, decimals) {
//     let roundedVector = [];
//     for (const component of vector) {
//         roundedVector.push(round(component, decimals));
//     }
//     return roundedVector;
// }

// #endregion

function updateRadiusInput() {
    // console.log("lol");
    // console.log(event);
    console.log(lengthInput.value);

    if (nSidesInput.value) {
        console.log(round(findRadiusFromSideLength(lengthInput.value, nSidesInput.value), 3));
        radiusInput.value = round(
            findRadiusFromSideLength(lengthInput.value, nSidesInput.value),
            3
        );
    }
}

function updateLengthInput() {
    // console.log("lol");
    // console.log(event);
    console.log(radiusInput.value);

    if (nSidesInput.value) {
        console.log(round(sideLengthFromRadius(radiusInput.value, nSidesInput.value), 3));
        lengthInput.value = round(sideLengthFromRadius(radiusInput.value, nSidesInput.value), 3);
    }
}

radiusInput.addEventListener("change", (event) => {
    updateLengthInput();
});

lengthInput.addEventListener("change", (event) => {
    updateRadiusInput();
});

nSidesInput.addEventListener("change", (event) => {
    updateLengthInput();
    updateRadiusInput();
});

calculateButton.addEventListener("click", (event) => {
    calculator.setBlank();

    if (nSidesInput.value && radiusInput && lengthInput) {
        console.log(findVector(radiusInput.value, nSidesInput.value, rotationInput.value));
        // console.log(
        //     (findVector(lengthInput.value, nSidesInput.value, rotationInput.value), 3).round()
        // );

        let rotation = Number(rotationInput.value);

        resultDiv.innerHTML = "";

        const roundTo = roundToInput.value ? roundToInput.value : 3;
        let v;
        let v0;
        let v1;

        let vectors = [];

        for (let i = 1; i <= nSidesInput.value; i++) {
            // if (v) v = findVector(lengthInput.value, nSidesInput.value, rotation, v);
            // if (v) let v1 = v

            v1 = v ? v : null;

            v = findVector(radiusInput.value, nSidesInput.value, rotation);
            // console.log(v);
            console.log(v.round(3));
            console.log(rotation);
            rotation += Number(360 / nSidesInput.value);

            // resultDiv.appendChild(
            //     `
            //     <div id="pos${i}" class="pos">
            //             <span>pos${i}:</span>
            //             <span class="white">${v.components}</span>
            //         </div>
            //     `
            // );

            vectors.push(v);

            if (i === 1) v0 = v;

            resultDiv.appendChild(createPositionNode(i, v.round(roundTo).components));

            // console.log(i, v.round(roundTo).components);
            console.log("(" + v.round(roundTo).components.join(", ") + ")");

            try {
                calculator.setExpression({
                    id: `P${i}`,
                    latex: "(" + v.round(roundTo).components.join(", ") + ")",
                });

                if (v1) {
                    console.log("v1 = " + v1.components);
                    console.log("v = " + v.components);
                    calculator.setExpression({
                        id: `segment${i - 1}`,
                        latex: `( (1-t)*${v1.components[0]} + t*${v.components[0]} , (1-t)*${v1.components[1]} + t*${v.components[1]} )`,
                        color: Desmos.Colors.BLUE,
                    });
                }
            } catch (error) {
                console.error(error);
            }
        }

        calculator.setExpression({
            id: `segment${nSidesInput.value}`,
            latex: `( (1-t)*${v.components[0]} + t*${v0.components[0]} , (1-t)*${v.components[1]} + t*${v0.components[1]} )`,
            color: Desmos.Colors.BLUE,
        });

        calculator.setExpression({
            id: "cicle",
            latex: `x^{2}+y^{2}=${radiusInput.value}^2`,
            color: "#aaa",
        });

        console.log(vectors);

        console.log(vectors[0].subtract(vectors[1]));
        console.log(vectors[0].subtract(vectors[1]).length());

        // calculator.setExpression({
        //     id: `segment${nSidesInput.value}`,
        //     latex: `( (1-t)*${v0.components[0] + 0.1} + t*0.1 , (1-t)*${
        //         v0.components[1] + 0.1
        //     } + t*0.1 )`,
        // });

        // calculator.setExpression({
        //     id: `segment${nSidesInput.value}`,
        //     latex: `( (1-t)*P1[0] + t*0.1 , (1-t)*P1[1] + t*0.1 )`,
        // });
    }
});

// BUGS:
/**
 * length and radius are inverted (fixed)
 *
 */
