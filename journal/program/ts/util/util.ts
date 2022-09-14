

export class Assignable {
    constructor(properties) {
        Object.keys(properties).map((key) => {
            return (this[key] = properties[key]);
        });
    };
};

export enum InstructionType {
    InitializeJournal,
    NewEntry,
};