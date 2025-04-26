import RapidLayoutInfoData from "../data/rr-layout-info-data";


export default class RapidURLMapping {
    public pageWithLayout: Array<RapidLayoutInfoData> = [];

    public publicLayout: RapidLayoutInfoData = new RapidLayoutInfoData();
    public privateLayout: RapidLayoutInfoData = new RapidLayoutInfoData();
    public authLayout: RapidLayoutInfoData = new RapidLayoutInfoData();
    public otherLayout: RapidLayoutInfoData = new RapidLayoutInfoData();


    public getLayoutsAndPages(): Array<RapidLayoutInfoData> {
        return []
    }

}