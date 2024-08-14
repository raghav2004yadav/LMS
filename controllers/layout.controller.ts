import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import LayoutModel from "../modals/layout.model";
import cloudinary from "cloudinary";
import layoutRouter from "../routes/layout.route";

//create layout

export const createLayout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type } = req.body;
    const isTypeExist = await LayoutModel.findOne({ type });
    if (isTypeExist) {
      return next(new ErrorHandler(`${type} already exist`, 400));
    }
    if (type === "Banner") {
      const { image, title, subTitle } = req.body;
      const myCloud = await cloudinary.v2.uploader.upload(image, {
        folder: "layout",
      });

      const banner = {
        image: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
        title,
        subTitle,
      };
      await LayoutModel.create();
    }

    if (type === "FAQ") {
      const { faq } = req.body;
      const FaqItems = await Promise.all(
        faq.map(async (item: any) => {
          return {
            question: item.question,
            answer: item.answer,
          };
        })
      );

      await LayoutModel.create({ type: "FAQ", faq: FaqItems });
    }

    if (type === "Categories") {
      const { categories } = req.body;

      const CategoriesItems = await Promise.all(
        categories.map(async (item: any) => {
          return {
            title: item.title,
          };
        })
      );
      await LayoutModel.create({
        type: "Categories",
        categories: CategoriesItems,
      });
    }

    res.status(200).json({
      success: true,
      message: "Layout created successfully",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};

//Edit layout

export const editLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;

      if (type === "Banner") {
        const bannerData: any = await LayoutModel.findOne({ type: "Banner" });

        const { image, title, subTitle } = req.body;
        if (bannerData) {
          await cloudinary.v2.uploader.destroy(bannerData.image.public_id);
        }

        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "layout",
        });

        const banner = {
          image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subTitle,
        };
        await LayoutModel.findByIdAndUpdate(bannerData.id, { banner });
      }

      if (type === "FAQ") {
        const { faq } = req.body;
        const FaqItem = await LayoutModel.findOne({ type: "FAQ" });
        const FaqItems = await Promise.all(
          faq.map(async (item: any) => {
            return {
              question: item.question,
              answer: item.answer,
            };
          })
        );

        await LayoutModel.findByIdAndUpdate(FaqItem, {
          type: "FAQ",
          faq: FaqItems,
        });
      }

      if (type === "Categories") {
        const { categories } = req.body;
        const categoriesData = await LayoutModel.findOne({
          type: "Categories",
        });
        const CategoriesItems = await Promise.all(
          categories.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );
        await LayoutModel.findByIdAndUpdate(categoriesData, {
          type: "Categories",
          categories: CategoriesItems,
        });
      }

      res.status(200).json({
        success: true,
        message: "Layout Updated successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get layout by type

export const getLayoutByType = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      const layout = await LayoutModel.findOne({ type });
      res.status(201).json({
        success: true,
        layout,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
