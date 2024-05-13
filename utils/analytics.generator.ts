import { Document,FilterQuery,Model } from "mongoose";

interface MonthData{
    month:string;
    count:string;
}
export async function generateLast12MonthsData<T extends Document>(
    model:Model<T>
):Promise<{last12Months:MonthData[]}>{
    const last12Months:MonthData[]=[];
    const currentDate=new Date();  //take a current date 
    currentDate.setDate(currentDate.getDate()+1);

    for(let i=11;i>=0;i--){
        const endDate=new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() - i * 28
        );

        const startDate=new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()-28
        );

        const monthYear=endDate.toLocaleString("default",{
            day:"numeric",
            month:"short",
            year:"numeric",
        });
        const filterQuery: FilterQuery<T> = {
            createdAt: {
                $gte: startDate,
                $lt: endDate,
            } as any,
        };

        const count = await model.countDocuments(filterQuery);

        last12Months.push({month:monthYear,count: count.toString() });
    }
    return {last12Months};

}









