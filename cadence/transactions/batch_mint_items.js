// NOTE: Imports in BATCH_MINT_ITEMS must be changed to testnet/mainnet addresses

module.exports = `
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import GarmentNFT from "../../contracts/GarmentNFT.cdc"
import MaterialNFT from "../../contracts/MaterialNFT.cdc"
import ItemNFT from "../../contracts/ItemNFT.cdc"
import FBRC from "../../contracts/FBRC.cdc"
import FungibleToken from "../../contracts/FungibleToken.cdc"

transaction(recipientAddr: Address, name: String, royaltyVaultAddr: Address) {

    let garmentCollectionRef: &GarmentNFT.Collection
    let materialCollectionRef: &MaterialNFT.Collection
    let royaltyVault: Capability<&FBRC.Vault{FungibleToken.Receiver}>
    let adminRef: &ItemNFT.Admin
    prepare(garmentAndMaterialAcct: AuthAccount) {


        self.adminRef = garmentAndMaterialAcct.borrow<&ItemNFT.Admin>(from: ItemNFT.AdminStoragePath)
            ?? panic("No admin resource in storage")
        // borrow a reference to the owner's garment collection
        self.garmentCollectionRef = garmentAndMaterialAcct.borrow<&GarmentNFT.Collection>(from: GarmentNFT.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the stored Garment collection")
        
        // borrow a reference to the owner's material collection
        self.materialCollectionRef = garmentAndMaterialAcct.borrow<&MaterialNFT.Collection>(from: MaterialNFT.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the stored Material collection")

        self.royaltyVault = getAccount(royaltyVaultAddr).getCapability<&FBRC.Vault{FungibleToken.Receiver}>(FBRC.CollectionReceiverPath)

    }

    execute {

        self.adminRef.changeItemDataNumberMintable(number: 50)
        let recipient = getAccount(recipientAddr)

        let nftReceiver = recipient
            .getCapability(ItemNFT.CollectionPublicPath)
            .borrow<&{ItemNFT.ItemCollectionPublic}>()
            ?? panic("Unable to borrow recipient's item collection")

        var i: UInt64 = 152
        while i < 302 {

            let garment <- self.garmentCollectionRef.withdraw(withdrawID: i)
        
            let material <- self.materialCollectionRef.withdraw(withdrawID: i)

            let garmentRef <- garment as! @GarmentNFT.NFT

            let materialRef <- material as! @MaterialNFT.NFT

            // mint item with the garment and material
            let nft <- ItemNFT.mintNFT(name: name, royaltyVault: self.royaltyVault, garment: <- garmentRef, material: <- materialRef)

            nftReceiver.deposit(token: <- nft)

            i = i + 1
        }


        self.adminRef.changeItemDataNumberMintable(number: 1)

    }
}

`