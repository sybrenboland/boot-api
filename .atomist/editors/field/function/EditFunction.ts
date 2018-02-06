import {Params} from "./Params";
import {Project} from "@atomist/rug/model/Project";


export abstract class EditFunction {

    private childEditFunction: EditFunction;

    public and(childEditFunction: EditFunction): EditFunction {

        if (this.childEditFunction == null) {
            this.childEditFunction = childEditFunction;
        } else {
            this.childEditFunction.and(childEditFunction);
        }

        return this;
    }

    public execute(project: Project, params: Params) {
        this.edit(project, params);

        if(this.childEditFunction != null) {
            this.childEditFunction.execute(project, params);
        }
    }

    abstract edit(project: Project, params: Params): void;

}