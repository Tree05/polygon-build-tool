let couldConnectToDesmos = true;
let calculator;

try {
    const elt = document.getElementById("calculator");
    calculator = Desmos.GraphingCalculator(elt, {
        expressions: false,
    });
} catch (error) {
    couldConnectToDesmos = false;
    document.querySelector("#calculator").textContent =
        "Couldn't connect to Desmos. Check your Internet Connection and try again";
    document.querySelector("#calculator").style.padding = "0 10px";
    document.querySelector("#calculator").style.width = "";
    document.querySelector("#graph").style.backgroundColor = "#ffffff40";
    console.error(error);
}
// calculator.setExpression({ id: "graph1", latex: "y=x^2" });

const nSidesInput = document.querySelector("#sides");
const radiusInput = document.querySelector("#radius");
const apothemInput = document.querySelector("#apothem");
const lengthInput = document.querySelector("#length");
const rotationInput = document.querySelector("#rotation");
const initialPositionInput = document.querySelector("#initial-position");
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

const sum = (arr) => arr.reduce((acc, value) => acc + value, 0);
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

    transform(matrix) {
        const columns = matrix.columns();
        if (columns.length !== this.components.length) {
            throw new Error("Matrix columns length should be equal to vector components length.");
        }

        const multiplied = columns.map((column, i) => column.map((c) => c * this.components[i]));
        const newComponents = multiplied[0].map((_, i) =>
            sum(multiplied.map((column) => column[i]))
        );
        return new Vector(...newComponents);
    }
}

class Matrix {
    constructor(...rows) {
        this.rows = rows;
    }
    columns() {
        return this.rows[0].map((_, i) => this.rows.map((r) => r[i]));
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

function radiusToApothem(radius, nSides) {
    return radius * Math.cos(Math.PI / nSides);
}

function apothemToRadius(apothem, nSides) {
    return apothem * (1 / Math.cos(Math.PI / nSides));
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
        // return;
    }
}

function updateRadiusInputApothem() {
    if (apothemInput.value) {
        console.log(round(apothemToRadius(apothemInput.value, nSidesInput.value), 3));
        radiusInput.value = round(apothemToRadius(apothemInput.value, nSidesInput.value), 3);
        // updateLengthInput();
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

function updateApothemInput() {
    if (radiusInput.value) {
        console.log(round(radiusToApothem(radiusInput.value, nSidesInput.value), 3));
        apothemInput.value = round(radiusToApothem(radiusInput.value, nSidesInput.value), 3);
    } else if (lengthInput.value) {
        updateRadiusInput();
        console.log(round(radiusToApothem(radiusInput.value, nSidesInput.value), 3));
        apothemInput.value = round(radiusToApothem(radiusInput.value, nSidesInput.value), 3);
    }
}

radiusInput.addEventListener("change", (event) => {
    updateLengthInput();
    updateApothemInput();
});

apothemInput.addEventListener("change", (event) => {
    updateRadiusInputApothem();
    updateLengthInput();
});

lengthInput.addEventListener("change", (event) => {
    updateRadiusInput();
    updateApothemInput();
});

nSidesInput.addEventListener("change", (event) => {
    updateLengthInput();
    updateRadiusInput();
    updateApothemInput();
});

calculateButton.addEventListener("click", (event) => {
    if (couldConnectToDesmos) calculator.setBlank();

    if (nSidesInput.value && radiusInput && lengthInput) {
        const initialPositionMatched = initialPositionInput.value.match(/-?\d+/g);
        const initialPositionFromOrigin = initialPositionInput.value
            ? new Vector(
                  Number(initialPositionMatched[0] || 0),
                  Number(initialPositionMatched[1] || 0)
              )
            : new Vector(0, 0);

        const matrixMatched = matrixTransformInput.value.match(/-?\d+/g);
        const matrix = matrixTransformInput.value
            ? new Matrix(
                  [Number(matrixMatched[0] || 0), Number(matrixMatched[1] || 0)],
                  [Number(matrixMatched[2] || 0), Number(matrixMatched[3] || 0)]
              )
            : new Matrix([1, 0], [0, 1]);

        const isFromVector =
            !!initialPositionMatched &&
            initialPositionMatched.length >= 3 &&
            Number(initialPositionMatched[2]) <= Number(nSidesInput.value)
                ? Number(initialPositionMatched[2] || null)
                : null;

        console.log("isFromVector", isFromVector);

        console.log(matrix);

        console.log(initialPositionFromOrigin);
        console.log(
            findVector(
                radiusInput.value,
                nSidesInput.value,
                rotationInput.value,
                initialPositionFromOrigin
            )
        );
        const roundTo = roundToInput.value ? roundToInput.value : 3;

        const initialPosition = isFromVector
            ? new Vector(0, 0).subtract(
                  findVector(
                      radiusInput.value,
                      nSidesInput.value,
                      Number(rotationInput.value) +
                          Number(360 / nSidesInput.value) * (isFromVector - 1),
                      new Vector(0, 0).subtract(initialPositionFromOrigin)
                  )
                      .transform(matrix)
                      .round(roundTo)
              )
            : initialPositionFromOrigin;

        console.log("initial position", initialPosition);
        console.log(
            "initial position angle: ",
            Number(rotationInput.value) + Number(360 / nSidesInput.value) * (isFromVector - 1)
        );

        // console.log(
        //     (findVector(lengthInput.value, nSidesInput.value, rotationInput.value), 3).round()
        // );

        let rotation = Number(rotationInput.value);

        resultDiv.innerHTML = "";

        let v;
        let v0;
        let v1;

        let vectors = [];

        for (let i = 1; i <= nSidesInput.value; i++) {
            // if (v) v = findVector(lengthInput.value, nSidesInput.value, rotation, v);
            // if (v) let v1 = v

            v1 = v ? v : null;

            v = findVector(radiusInput.value, nSidesInput.value, rotation, initialPosition)
                .transform(matrix)
                .round(roundTo);
            // console.log(v);
            console.log(v.round(3));
            console.log(rotation);
            rotation += Number(360 / nSidesInput.value);

            vectors.push(v);

            if (i === 1) v0 = v;

            resultDiv.appendChild(createPositionNode(i, v.components));

            // console.log(i, v.components);
            console.log("(" + v.components.join(", ") + ")");

            if (couldConnectToDesmos)
                try {
                    calculator.setExpression({
                        id: `P${i}`,
                        latex: "(" + v.components.join(", ") + ")",
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

        if (couldConnectToDesmos) {
            calculator.setExpression({
                id: `segment${nSidesInput.value}`,
                latex: `( (1-t)*${v.components[0]} + t*${v0.components[0]} , (1-t)*${v.components[1]} + t*${v0.components[1]} )`,
                color: Desmos.Colors.BLUE,
            });

            calculator.setExpression({
                id: "cicle",
                latex: `(x- ${initialPosition.components[0]})^{2} +
            (y- ${initialPosition.components[1]})^{2}= (${round(radiusInput.value, roundTo)}) ^2`,
                color: "#aaa",
            });

            // calculator.setExpression({
            //     id: "ellipse",
            //     latex: `( (x * cos(a) - y * sin(a) )^2 / (${matrix.rows[0][0]})^2 ) +
            //     ( (x * sin(a) - y * cos(a) )^2 / (${matrix.rows[1][1]})^2 ) =
            //     ${round(radiusInput.value, roundTo)}^2`,
            // });

            // calculator.setExpression({
            //     id: "a",
            //     latex: `a = ${matrix.rows[0][1]}`,
            // });

            calculator.setExpression({
                id: "origin",
                latex: `(${initialPosition.components[0]}, ${initialPosition.components[1]})`,
                color: "#888",
            });
        }

        console.log(vectors);

        if (vectors[1]) {
            console.log(vectors[0].subtract(vectors[1]));
            console.log(vectors[0].subtract(vectors[1]).length());
        }

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
