// 引入 @google-cloud/language 包
import { LanguageServiceClient } from "@google-cloud/language";

// 创建 LanguageServiceClient 实例
const languageClient = new LanguageServiceClient();

export const analyzeEntities = async (text) => {
  // 构造请求对象
  const document = {
    content: text,
    type: "PLAIN_TEXT",
  };

  // 调用 Natural Language API
  return languageClient
    .analyzeEntities({ document })
    .then((results) => {
      const entities = results[0].entities;
      console.log("Entities:");
      entities.forEach((entity) => {
        console.log(entity.name);
      });
      return entities;
    })
    .catch((err) => {
      console.error("Error analyzing text:", err);
    });
};
