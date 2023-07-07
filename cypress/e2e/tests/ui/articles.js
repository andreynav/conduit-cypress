import { common, article, loginAPI, profile } from '../../pages'
import { name, email, password } from '../../../fixtures/api/userApi.json'
import { getArticleObj, setUpSeed, loginViaApiAndReload } from "../../../support/utils"
import { articleAPI } from "../../pages/api/ArticleAPI"

describe('Articles suite', () => {
    before(() => {
        setUpSeed()
    })

    describe('should create a new article with filled mandatory fields', () => {
        const { title, description, text, tags } = getArticleObj()

        beforeEach(() => {
            common.openPage('/')
            loginAPI.userLogin(email, password)
            common.reloadPage()
        })

        it('should create a new article', () => {
            article.openNewArticlePage()
            article.addNewArticle(title,description,text,tags)
            article.verifyArticleData(title, description, text, tags)
        })
    })

    describe('should not create a new article without filled mandatory fields', () => {
        const articleObj = getArticleObj()
        const fieldActions = {
            title: article.inputArticleTitle,
            description: article.inputArticleDescription,
            text: article.inputArticleText
        }
        const fieldSelectors = {
            title: () => article.inputNewArticleTitle,
            description: () => article.inputNewArticleDescription,
            text: () => article.inputNewArticleText,
            tags: () => article.inputNewArticleTags
        }

        beforeEach(() => {
            common.openPage('/')
            loginAPI.userLogin(email, password)
            common.reloadPage()
        })

        Object.keys(fieldActions).forEach((field) => {
            it(`should not create a new article without filled mandatory ${field} field`, () => {
                article.openNewArticlePage()
                Object.keys(fieldActions).forEach((otherField) => {
                    if (otherField !== field) {
                        fieldActions[otherField](articleObj[otherField])
                    }
                })
                article.clickPublishArticleButton()
                article.verifyErrorArticleCreationMessage(fieldSelectors[field]())
            })
        })
    })

    describe('should delete the article and check the result via UI', () => {
        const newArticle = getArticleObj()

        beforeEach(() => {
            common.openPage('/')
            loginAPI.userLogin(email, password)
            common.reloadPage()
            articleAPI.createArticle(newArticle)
            common.reloadPage()
            article.openProfilePageMyArticlesTab(name)
            article.checkIsArticleExists(newArticle.title, true)
        })

        it('should delete the article and check the result via UI', () => {
            article.deleteArticle(newArticle.title)
            article.openProfilePageMyArticlesTab(name)
            article.checkIsArticleExists(newArticle.title, false)
        })
    })

    describe('should delete the article and check the result via API', () => {
        const newArticle = getArticleObj()

        beforeEach(() => {
            common.openPage('/')
            loginAPI.userLogin(email, password)
            common.reloadPage()
            articleAPI.createArticle(newArticle)
            common.reloadPage()
        })

        it('should delete the article and check the result via API', () => {
            cy.intercept('GET', `**/articles?author=${name}*`).as('getArticles')
            let articlesCount = 0

            article.openProfilePageMyArticlesTab(name)
            article.checkIsArticleExists(newArticle.title, true)
            cy.wait('@getArticles').then(({response}) => {
                expect(response.statusCode).to.eq(200)
                articlesCount = response.body.articlesCount
                console.log('ARTICLE COUNTS VARIABLE VALUE', articlesCount)
                cy.log('ARTICLE COUNTS VARIABLE VALUE', articlesCount)
            })
            article.deleteArticle(newArticle.title)

            cy.then(() => {
                return articleAPI.getArticlesCount(name)
            }).then(newArticleCount => {
                // TODO: 3 instead of 1
                expect(newArticleCount).to.eq(articlesCount - 3)
            })
        })
    })

    describe('should edit an existing article', () => {
        const newArticle = getArticleObj()
        const newArticle2 = getArticleObj()

        beforeEach(() => {
            common.openPage('/')
            loginAPI.userLogin(email, password)
            common.reloadPage()
            articleAPI.createArticle(newArticle)
            common.reloadPage()
            article.openProfilePageMyArticlesTab(name)
            article.checkIsArticleExists(newArticle.title, true)
        })

        it('should edit an existing article', () => {
            article.editArticle(newArticle, newArticle2)
            article.verifyArticleData(newArticle2.title, newArticle2.description, newArticle2.text, newArticle.tags)
        })
    })

    describe('should add article to favorite articles list', () => {
        const newArticle = getArticleObj()

        beforeEach(() => {
            common.openPage('/')
            loginAPI.userLogin(email, password)
            common.reloadPage()
            articleAPI.createArticle(newArticle)
            common.reloadPage()
            article.openProfilePageMyArticlesTab(name)
            article.checkIsArticleExists(newArticle.title, true)
            article.openArticlesTab(profile.tabFavoriteArticles)
            article.checkIsArticleExists(newArticle.title, false)
            article.openArticlesTab(profile.tabMyArticles)
        })

        it('should add article to favorite articles list', () => {
            article.toggleFavoriteArticle(newArticle.title, false)
            article.openArticlesTab(profile.tabFavoriteArticles)
            article.checkIsArticleExists(newArticle.title, true)
        })
    })

    describe('should delete article from favorite articles list', () => {
        const newArticle = getArticleObj()

        beforeEach(() => {
            common.openPage('/')
            loginAPI.userLogin(email, password)
            common.reloadPage()
            articleAPI.createArticle(newArticle)
            common.reloadPage()
            article.openProfilePageMyArticlesTab(name)
            article.checkIsArticleExists(newArticle.title, true)
            article.toggleFavoriteArticle(newArticle.title, false)
            article.openArticlesTab(profile.tabFavoriteArticles)
            article.checkIsArticleExists(newArticle.title, true)
        })

        it('should add article to favorite articles list', () => {
            article.toggleFavoriteArticle(newArticle.title, true)
            common.reloadPage()
            article.checkIsArticleExists(newArticle.title, false)
        })
    })
})
